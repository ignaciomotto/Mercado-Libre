from fastapi import APIRouter, Depends, HTTPException,status

from sqlalchemy.orm import Session

from ..db.connection import get_db

from ..schemas.rating_schema import (
    RatingCreateDTO,
    RatingResponseDTO
)
from ..db.models.user_model import User
from ..services.rating_service import RatingService
from ..dependencies.auth import get_current_user


router = APIRouter(
    prefix="/ratings",
    tags=["Ratings"]
)

@router.post(
    "/purchases/{purchase_id}",
    response_model=RatingResponseDTO,
    status_code=status.HTTP_201_CREATED
)
def create_rating(
    purchase_id: int,
    rating_data: RatingCreateDTO,
    rater_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (rater_id, 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = RatingService(db)

    try:
        return service.create_rating(
            purchase_id,
            rater_id,
            rating_data
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )