from src.models.question import Question
from src.dtos.question import (
    QuestionCreateDTO,
    QuestionResponseDTO
)


def question_create_to_model(
    dto: QuestionCreateDTO,
    listing_id: int
) -> Question:

    return Question(
        listing_id=listing_id,
        author_id=dto.author_id,
        text=dto.text
    )


def question_to_response_dto(
    question: Question
) -> QuestionResponseDTO:

    return QuestionResponseDTO(
        id=question.id,
        listing_id=question.listing_id,
        author_id=question.author_id,
        text=question.text,
        date=question.date,
        answer=None
    )