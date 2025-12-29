from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)


def now_utc() -> datetime:
    return datetime.utcnow()


class ReminderOut(BaseOut):
    id: str
    remind_at: datetime
    message: str
    sent: bool = False


class ReminderCreate(BaseModel):
    remind_at: datetime
    message: str = Field(min_length=1, max_length=300)

