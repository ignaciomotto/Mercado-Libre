from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from ..db.connection import get_db

from ..schemas.rating_schema import (
    RatingCreateDTO,
    RatingResponseDTO
)

from ..services.rating_service import RatingService


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
    db: Session = Depends(get_db)
):
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