from sqlalchemy.orm import Session

from ..db.models.question_model import Question
from ..db.models.answer_model import Answer
from ..db.models.listing_model import Listing

from ..mappers.question_mapper import (
    question_to_response_dto,
    answer_create_to_model
)

def answer_question(
    self,
    question_id: int,
    seller_id: int,
    text: str
):
    question = (
        self.db.query(Question)
        .filter(Question.id == question_id)
        .first()
    )

    if not question:
        raise ValueError(
            "La pregunta no existe"
        )

    listing = (
        self.db.query(Listing)
        .filter(Listing.id == question.listing_id)
        .first()
    )

    if not listing:
        raise ValueError(
            "La publicación no existe"
        )

    # El vendedor se obtiene del listing
    if listing.seller_id != seller_id:
        raise ValueError(
            "Solo el vendedor puede responder"
        )

    existing_answer = (
        self.db.query(Answer)
        .filter(
            Answer.question_id == question_id
        )
        .first()
    )

    if existing_answer:
        raise ValueError(
            "La pregunta ya tiene una respuesta"
        )

    answer = answer_create_to_model(
        question_id=question_id,
        text=text
    )

    self.db.add(answer)
    self.db.commit()
    self.db.refresh(answer)

    return question_to_response_dto(
        question,
        answer
    )