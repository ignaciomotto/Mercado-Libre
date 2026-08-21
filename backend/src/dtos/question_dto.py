from datetime import datetime
from pydantic import BaseModel


class AnswerCreateDTO(BaseModel):
    text: str


class AnswerResponseDTO(BaseModel):
    id: int
    question_id: int
    text: str
    date: datetime

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
    answer: AnswerResponseDTO | None = None
    author_name: str | None = None

    class Config:
        from_attributes = True