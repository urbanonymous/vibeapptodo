from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.mongo import oid, utcnow
from app.services.projects import PROJECTS_COL, REMINDERS_COL, STEP_PROGRESS_COL


def _oid_or_none(id_str: str) -> ObjectId | None:
    try:
        return ObjectId(id_str)
    except Exception:
        return None


def _to_str_id(doc: dict[str, Any]) -> dict[str, Any]:
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    d["project_id"] = str(d["project_id"])
    return d


async def create_reminder(
    db: AsyncIOMotorDatabase,
    user_id: str,
    project_id: str,
    step_number: int,
    remind_at,
    message: str,
) -> dict[str, Any] | None:
    project_oid = _oid_or_none(project_id)
    if not project_oid:
        return None

    proj = await db[PROJECTS_COL].find_one({"_id": project_oid, "user_id": user_id})
    if not proj:
        return None

    reminder_id = oid()
    doc = {
        "_id": reminder_id,
        "user_id": user_id,
        "project_id": project_oid,
        "step_number": int(step_number),
        "remind_at": remind_at,
        "message": message,
        "sent": False,
        "created_at": utcnow(),
    }
    await db[REMINDERS_COL].insert_one(doc)

    # Also embed into step_progress for convenience in the project view response
    await db[STEP_PROGRESS_COL].update_one(
        {"project_id": project_oid, "step_number": int(step_number)},
        {
            "$push": {
                "reminders": {
                    "id": str(reminder_id),
                    "remind_at": remind_at,
                    "message": message,
                    "sent": False,
                }
            }
        },
        upsert=True,
    )

    return _to_str_id(doc)


async def list_reminders(db: AsyncIOMotorDatabase, user_id: str) -> list[dict[str, Any]]:
    cur = db[REMINDERS_COL].find({"user_id": user_id}).sort("remind_at", 1)
    return [_to_str_id(r) async for r in cur]

