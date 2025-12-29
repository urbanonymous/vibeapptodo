from fastapi import APIRouter

from app.services.steps import get_steps

router = APIRouter(tags=["steps"])


@router.get("/steps")
async def list_step_templates():
    return get_steps()

