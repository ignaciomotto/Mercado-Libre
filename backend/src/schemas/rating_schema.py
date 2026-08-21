from datetime import datetime

from pydantic import BaseModel, Field


class RatingCreateDTO(BaseModel):
    score: int = Field(ge=1, le=5)
    comment: str | None = None


class RatingResponseDTO(BaseModel):
    id: int
    purchase_id: int
    rater_id: int
    rated_id: int
    score: int
    comment: str | None
    date: datetime

    class Config:
        from_attributes = True