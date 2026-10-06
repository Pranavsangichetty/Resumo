from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResumeCreate(BaseModel):
    title: str = Field(
        default="Untitled Resume",
        min_length=1,
        max_length=255,
    )
    content: str | None = None
    original_filename: str | None = None


class ResumeUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    content: str | None = None


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str | None
    original_filename: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)