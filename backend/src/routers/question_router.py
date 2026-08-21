from fastapi import APIRouter,Depends,HTTPException,status

from sqlalchemy.orm import Session

from ..db.connection import get_db

from ..schemas.question_schema import (
    QuestionCreateDTO,
    AnswerCreateDTO,
    QuestionResponseDTO
)
from ..db.models.user_model import User
from ..services.question_service import QuestionService
from ..dependencies.auth import get_current_user


router = APIRouter(
    prefix="/publications",
    tags=["Questions"]
)

@router.post(
    "/{listing_id}/ask",
    response_model=QuestionResponseDTO,
    status_code=status.HTTP_201_CREATED
)
def create_question(
    listing_id: int,
    question_data: QuestionCreateDTO,
    author_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (author_id, 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = QuestionService(db)

    try:
        return service.create_question(
            listing_id,
            author_id,
            question_data.text
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

@router.get(
    "/{listing_id}/questions",
    response_model=list[QuestionResponseDTO]
)
def get_listing_questions(
    listing_id: int,
    db: Session = Depends(get_db)
):
    service = QuestionService(db)

    questions = service.get_listing_questions(
        listing_id
    )

    if questions is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicación no encontrada"
        )

    return questions

answer_router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)

@answer_router.post(
    "/{question_id}/answer",
    response_model=QuestionResponseDTO
)
def answer_question(
    question_id: int,
    answer_data: AnswerCreateDTO,
    seller_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (seller_id, 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = QuestionService(db)

    try:
        return service.answer_question(
            question_id,
            seller_id,
            answer_data.text
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )