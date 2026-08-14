from pydantic import BaseModel, Field


class RatingCreateDTO(BaseModel):
    purchase_id: int
    author_id: int
    receiver_id: int
    score: int = Field(..., ge=1, le=5)
    comment: str | None = None


class RatingResponseDTO(BaseModel):
    id: int
    purchase_id: int
    author_id: int
    receiver_id: int
    score: int
    comment: str | None

    class Config:
        from_attributes = True