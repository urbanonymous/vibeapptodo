from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DB
from app.models.projects import ProjectCreate, ProjectOut, ProjectUpdate, StepProgressOut, StepProgressPatch
from app.services.projects import (
    create_project,
    delete_project,
    ensure_user,
    get_project,
    list_projects,
    list_step_progress,
    update_project,
    update_step_progress,
)
from app.services.steps import get_steps

router = APIRouter(tags=["projects"])


@router.get("/projects", response_model=list[ProjectOut])
async def projects_list(db=DB, decoded=CurrentUser):
    await ensure_user(db, decoded)
    uid = decoded.get("uid")
    return await list_projects(db, uid)


@router.post("/projects", response_model=ProjectOut)
async def projects_create(body: ProjectCreate, db=DB, decoded=CurrentUser):
    await ensure_user(db, decoded)
    uid = decoded.get("uid")
    return await create_project(db, uid, body.name, body.description)


@router.get("/projects/{project_id}")
async def projects_get(project_id: str, db=DB, decoded=CurrentUser):
    await ensure_user(db, decoded)
    uid = decoded.get("uid")
    proj = await get_project(db, uid, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    steps = get_steps()
    progress = await list_step_progress(db, __oid(project_id))
    return {"project": proj, "steps": steps, "progress": [_normalize_progress(p) for p in progress]}


@router.put("/projects/{project_id}", response_model=ProjectOut)
async def projects_update(project_id: str, body: ProjectUpdate, db=DB, decoded=CurrentUser):
    await ensure_user(db, decoded)
    uid = decoded.get("uid")
    updated = await update_project(db, uid, project_id, body.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated


@router.delete("/projects/{project_id}")
async def projects_delete(project_id: str, db=DB, decoded=CurrentUser):
    await ensure_user(db, decoded)
    uid = decoded.get("uid")
    ok = await delete_project(db, uid, project_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}


@router.get("/projects/{project_id}/steps", response_model=list[StepProgressOut])
async def projects_steps_get(project_id: str, db=DB, decoded=CurrentUser):
    await ensure_user(db, decoded)
    uid = decoded.get("uid")
    proj = await get_project(db, uid, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    progress = await list_step_progress(db, __oid(project_id))
    return [_normalize_progress(p) for p in progress]


@router.put("/projects/{project_id}/steps/{step_number}", response_model=StepProgressOut)
async def projects_step_update(project_id: str, step_number: int, body: StepProgressPatch, db=DB, decoded=CurrentUser):
    await ensure_user(db, decoded)
    uid = decoded.get("uid")
    updated = await update_step_progress(db, uid, project_id, int(step_number), body.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Project or step not found")
    return _normalize_progress(updated)


def _normalize_progress(doc: dict) -> dict:
    d = dict(doc)
    d.pop("_id", None)
    d.pop("project_id", None)
    d["step_number"] = int(d.get("step_number"))
    d["progress_percent"] = int(d.get("progress_percent") or 0)
    d["status"] = d.get("status") or "not_started"
    d["notes"] = d.get("notes") or ""
    d["reminders"] = d.get("reminders") or []
    return d


def __oid(project_id: str):
    from bson import ObjectId

    try:
        return ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project id")

