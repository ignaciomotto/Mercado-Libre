from datetime import datetime
from pydantic import BaseModel


class AnswerCreateDTO(BaseModel):
    question_id: int
    text: str


class AnswerResponseDTO(BaseModel):
    id: int
    question_id: int
    text: str
    date: datetime

    class Config:
        from_attributes = True