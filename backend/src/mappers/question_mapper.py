from ..db.models.question_model import Question
from ..dtos.question_dto import (
    QuestionCreateDTO,
    QuestionResponseDTO,
    AnswerCreateDTO,
    AnswerResponseDTO
)

def answer_create_to_model(
    question_id: int,
    text: str
):
    return AnswerCreateDTO(
        question_id=question_id,
        text=text
    )

def answer_to_schema(answer):
    return AnswerResponseDTO(
        id=answer.id,
        question_id=answer.question_id,
        text=answer.text,
        date=answer.date
    )

def question_create_to_model(
    listing_id: int,
    author_id: int,
    text: str
) -> Question:

    return Question(
        listing_id=listing_id,
        author_id=author_id,
        text=text
    )


def question_to_response_dto(
    question: Question,
    answer=None,
    author_name=None
) -> QuestionResponseDTO:

    return QuestionResponseDTO(
        id=question.id,
        listing_id=question.listing_id,
        author_id=question.author_id,
        text=question.text,
        date=question.date,
        answer=answer_to_schema(answer) if answer else None,
        author_name=author_name
    )