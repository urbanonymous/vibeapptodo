from pydantic import BaseModel, Field

from app.models.common import BaseOut


class ResourceOut(BaseOut):
    id: str
    type: str = Field(min_length=1, max_length=24)
    title: str = Field(min_length=1, max_length=140)
    url: str = Field(min_length=3, max_length=1000)
    description: str | None = Field(default=None, max_length=600)


class StepTemplateOut(BaseOut):
    number: int
    title: str
    description: str
    phase: str
    resources: list[ResourceOut] = []
    external_links: list[ResourceOut] = []

