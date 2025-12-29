from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.mongo import to_str_id, utcnow
from app.services.steps import get_steps


PROJECTS_COL = "projects"
STEP_PROGRESS_COL = "step_progress"
USERS_COL = "users"
REMINDERS_COL = "reminders"


def _oid_or_none(id_str: str) -> ObjectId | None:
    try:
        return ObjectId(id_str)
    except Exception:
        return None


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await db[PROJECTS_COL].create_index([("user_id", 1), ("updated_at", -1)])
    await db[STEP_PROGRESS_COL].create_index([("project_id", 1), ("step_number", 1)], unique=True)
    await db[USERS_COL].create_index([("firebase_uid", 1)], unique=True)
    await db[REMINDERS_COL].create_index([("user_id", 1), ("sent", 1), ("remind_at", 1)])
    await db[REMINDERS_COL].create_index([("project_id", 1), ("step_number", 1)])


async def ensure_user(db: AsyncIOMotorDatabase, decoded: dict) -> None:
    uid = decoded.get("uid")
    if not uid:
        return
    await db[USERS_COL].update_one(
        {"firebase_uid": uid},
        {
            "$setOnInsert": {"firebase_uid": uid, "created_at": utcnow()},
            "$set": {
                "email": decoded.get("email"),
                "display_name": decoded.get("name") or decoded.get("displayName"),
                "last_seen_at": utcnow(),
            },
        },
        upsert=True,
    )


async def list_projects(db: AsyncIOMotorDatabase, user_id: str) -> list[dict[str, Any]]:
    cur = db[PROJECTS_COL].find({"user_id": user_id}).sort("updated_at", -1)
    return [to_str_id(p) async for p in cur]


async def create_project(db: AsyncIOMotorDatabase, user_id: str, name: str, description: str) -> dict[str, Any]:
    now = utcnow()
    doc = {
        "user_id": user_id,
        "name": name,
        "description": description,
        "overall_progress": 0,
        "created_at": now,
        "updated_at": now,
    }
    res = await db[PROJECTS_COL].insert_one(doc)
    project_id = res.inserted_id

    steps = get_steps()
    progress_docs = [
        {
            "project_id": project_id,
            "step_number": int(s.get("number")),
            "status": "not_started",
            "progress_percent": 0,
            "notes": "",
            "completed_at": None,
            "reminders": [],
        }
        for s in steps
    ]
    if progress_docs:
        await db[STEP_PROGRESS_COL].insert_many(progress_docs)

    created = await db[PROJECTS_COL].find_one({"_id": project_id, "user_id": user_id})
    return to_str_id(created)


async def get_project(db: AsyncIOMotorDatabase, user_id: str, project_id: str) -> dict[str, Any] | None:
    oid = _oid_or_none(project_id)
    if not oid:
        return None
    doc = await db[PROJECTS_COL].find_one({"_id": oid, "user_id": user_id})
    return to_str_id(doc) if doc else None


async def update_project(
    db: AsyncIOMotorDatabase, user_id: str, project_id: str, patch: dict[str, Any]
) -> dict[str, Any] | None:
    oid = _oid_or_none(project_id)
    if not oid:
        return None
    patch = {k: v for k, v in patch.items() if v is not None}
    if not patch:
        return await get_project(db, user_id, project_id)
    patch["updated_at"] = utcnow()
    await db[PROJECTS_COL].update_one({"_id": oid, "user_id": user_id}, {"$set": patch})
    return await get_project(db, user_id, project_id)


async def delete_project(db: AsyncIOMotorDatabase, user_id: str, project_id: str) -> bool:
    oid = _oid_or_none(project_id)
    if not oid:
        return False
    res = await db[PROJECTS_COL].delete_one({"_id": oid, "user_id": user_id})
    if res.deleted_count:
        await db[STEP_PROGRESS_COL].delete_many({"project_id": oid})
        return True
    return False


async def list_step_progress(db: AsyncIOMotorDatabase, project_oid: ObjectId) -> list[dict[str, Any]]:
    cur = db[STEP_PROGRESS_COL].find({"project_id": project_oid}).sort("step_number", 1)
    return [p async for p in cur]


async def update_step_progress(
    db: AsyncIOMotorDatabase, user_id: str, project_id: str, step_number: int, patch: dict[str, Any]
) -> dict[str, Any] | None:
    oid = _oid_or_none(project_id)
    if not oid:
        return None

    proj = await db[PROJECTS_COL].find_one({"_id": oid, "user_id": user_id})
    if not proj:
        return None

    patch = {k: v for k, v in patch.items() if v is not None}
    if "progress_percent" in patch:
        p = int(patch["progress_percent"])
        patch["progress_percent"] = max(0, min(100, p))
        if patch["progress_percent"] == 100 and patch.get("status") is None:
            patch["status"] = "completed"

    if patch.get("status") == "completed" and patch.get("completed_at") is None:
        patch["completed_at"] = utcnow()

    await db[STEP_PROGRESS_COL].update_one(
        {"project_id": oid, "step_number": step_number},
        {"$set": patch, "$setOnInsert": {"project_id": oid, "step_number": step_number}},
        upsert=True,
    )

    # Recompute overall progress
    steps = get_steps()
    n_steps = max(1, len(steps))
    agg = await db[STEP_PROGRESS_COL].aggregate(
        [
            {"$match": {"project_id": oid}},
            {"$group": {"_id": "$project_id", "avg": {"$avg": "$progress_percent"}}},
        ]
    ).to_list(length=1)
    overall = int(round((agg[0]["avg"] if agg else 0) or 0))
    await db[PROJECTS_COL].update_one({"_id": oid}, {"$set": {"overall_progress": overall, "updated_at": utcnow()}})

    updated = await db[STEP_PROGRESS_COL].find_one({"project_id": oid, "step_number": step_number})
    if not updated:
        return None
    updated.pop("_id", None)
    updated["project_id"] = str(updated["project_id"])
    return updated

