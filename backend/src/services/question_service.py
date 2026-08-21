from sqlalchemy.orm import Session

from ..db.models.question_model import Question
from ..db.models.answer_model import Answer
from ..db.models.listing_model import Listing
from ..db.models.user_model import User

from ..mappers.question_mapper import (
    question_create_to_model,
    question_to_response_dto
)

class QuestionService:

    def __init__(self, db: Session):
        self.db = db

    def create_question(
        self,
        listing_id: int,
        author_id: int,
        text: str
    ):
        listing = (
            self.db.query(Listing)
            .filter(Listing.id == listing_id)
            .first()
        )

        if not listing:
            raise ValueError(
                "La publicación no existe"
            )

        # El vendedor no puede preguntarse a sí mismo
        if listing.seller_id == author_id:
            raise ValueError(
                "El vendedor no puede preguntar en su propia publicación"
            )

        question = question_create_to_model(
            listing_id=listing_id,
            author_id=author_id,
            text=text
        )

        self.db.add(question)
        self.db.commit()
        self.db.refresh(question)

        return question_to_response_dto(question, author_name=self.db.query(User.name).filter(User.id == author_id).scalar())

    def get_listing_questions(
        self,
        listing_id: int
    ):
        listing = (
            self.db.query(Listing)
            .filter(Listing.id == listing_id)
            .first()
        )

        if not listing:
            return None

        questions = (
            self.db.query(Question)
            .filter(
                Question.listing_id == listing_id
            )
            .order_by(
                Question.date.asc()
            )
            .all()
        )

        result = []

        for question in questions:
            answer = (
                self.db.query(Answer)
                .filter(Answer.question_id == question.id)
                .first()
            )

            result.append(
                question_to_response_dto(
                    question,
                    answer,
                    self.db.query(User.name).filter(User.id == question.author_id).scalar()
                )
            )

        return result

    def answer_question(self, question_id: int, seller_id: int, text: str):
        question = self.db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise ValueError("La pregunta no existe")
        listing = self.db.query(Listing).filter(Listing.id == question.listing_id).first()
        if not listing:
            raise ValueError("La publicación no existe")
        if listing.seller_id != seller_id:
            raise ValueError("Solo el vendedor puede responder")
        if self.db.query(Answer).filter(Answer.question_id == question_id).first():
            raise ValueError("La pregunta ya tiene una respuesta")
        answer = Answer(question_id=question_id, text=text)
        self.db.add(answer)
        self.db.commit()
        self.db.refresh(answer)
        return question_to_response_dto(
            question,
            answer,
            self.db.query(User.name).filter(User.id == question.author_id).scalar()
        )
