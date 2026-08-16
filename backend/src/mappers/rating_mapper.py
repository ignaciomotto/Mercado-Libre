from src.db.models.rating_model import Rating
from src.dtos.rating_dto import (
    RatingCreateDTO,
    RatingResponseDTO
)


def rating_create_to_model(
    dto: RatingCreateDTO,
    purchase_id: int,
    receiver_id: int
) -> Rating:

    return Rating(
        purchase_id=purchase_id,
        author_id=dto.author_id,
        receiver_id=receiver_id,
        score=dto.score,
        comment=dto.comment
    )


def rating_to_response_dto(
    rating: Rating
) -> RatingResponseDTO:

    return RatingResponseDTO(
        id=rating.id,
        purchase_id=rating.purchase_id,
        author_id=rating.author_id,
        receiver_id=rating.receiver_id,
        score=rating.score,
        comment=rating.comment
    )