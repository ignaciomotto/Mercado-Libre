from datetime import datetime
from pydantic import BaseModel


class QuestionCreateDTO(BaseModel):
    text: str


class AnswerCreateDTO(BaseModel):
    text: str


class AnswerResponseDTO(BaseModel):
    id: int
    question_id: int
    text: str
    date: datetime


class QuestionResponseDTO(BaseModel):
    id: int
    listing_id: int
    author_id: int
    text: str
    date: datetime
    answer: AnswerResponseDTO | None = None