from datetime import datetime
from pydantic import BaseModel


class QuestionCreateDTO(BaseModel):
    listing_id: int
    author_id: int
    text: str


class QuestionResponseDTO(BaseModel):
    id: int
    listing_id: int
    author_id: int
    text: str
    date: datetime

    class Config:
        from_attributes = True