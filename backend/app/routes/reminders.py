from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DB
from app.models.common import ReminderCreate
from app.services.projects import ensure_user
from app.services.reminders import create_reminder, list_reminders

router = APIRouter(tags=["reminders"])


@router.get("/reminders")
async def reminders_list(db=DB, decoded=CurrentUser):
    await ensure_user(db, decoded)
    uid = decoded.get("uid")
    return await list_reminders(db, uid)


@router.post("/reminders")
async def reminders_create(
    project_id: str,
    step_number: int,
    body: ReminderCreate,
    db=DB,
    decoded=CurrentUser,
):
    await ensure_user(db, decoded)
    uid = decoded.get("uid")
    created = await create_reminder(db, uid, project_id, int(step_number), body.remind_at, body.message)
    if not created:
        raise HTTPException(status_code=404, detail="Project not found")
    return created

