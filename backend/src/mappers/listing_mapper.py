from src.db.models.listing_model import Listing
from src.dtos.listing_dto import (
    ListingCreateDTO,
    ListingResponseDTO
)


def listing_create_to_model(
    dto: ListingCreateDTO
) -> Listing:

    return Listing(
        seller_id=dto.seller_id,
        title=dto.title,
        description=dto.description,
        price=dto.price,
        stock=dto.stock,
        category_id=dto.category_id,
        status="Active"
    )


def listing_to_response_dto(
    listing: Listing
) -> ListingResponseDTO:

    return ListingResponseDTO(
        id=listing.id,
        seller_id=listing.seller_id,
        title=listing.title,
        description=listing.description,
        price=listing.price,
        stock=listing.stock,
        category_id=listing.category_id,
        status=listing.status
    )