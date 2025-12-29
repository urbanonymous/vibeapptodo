from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.models.common import BaseOut


StepStatus = Literal["not_started", "in_progress", "completed", "skipped"]


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=600)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = Field(default=None, max_length=600)


class ProjectOut(BaseOut):
    id: str
    name: str
    description: str
    overall_progress: int
    created_at: datetime
    updated_at: datetime


class StepProgressPatch(BaseModel):
    status: StepStatus | None = None
    progress_percent: int | None = Field(default=None, ge=0, le=100)
    notes: str | None = Field(default=None, max_length=8000)
    completed_at: datetime | None = None


class StepProgressOut(BaseOut):
    step_number: int
    status: StepStatus
    progress_percent: int
    notes: str
    completed_at: datetime | None = None
    reminders: list[dict] = []

