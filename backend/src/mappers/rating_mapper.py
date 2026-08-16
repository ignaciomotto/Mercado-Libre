from src.db.models.rating_model import Rating
from src.dtos.rating_dto import (
    RatingCreateDTO,
    RatingResponseDTO
)


def rating_to_schema(rating):
    return RatingResponseDTO(
        id=rating.id,
        purchase_id=rating.purchase_id,
        author_id=rating.rater_id,
        receiver_id=rating.rated_id,
        score=rating.score,
        comment=rating.comment,
        date=rating.date
    )


def rating_create_to_model(
    purchase_id: int,
    rater_id: int,
    rated_id: int,
    score: int,
    comment: str | None
):
    return Rating(
        purchase_id=purchase_id,
        rater_id=rater_id,
        rated_id=rated_id,
        score=score,
        comment=comment
    )