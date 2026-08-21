from src.db.models.listing_model import Listing
from src.dtos.listing_dto import (
    ListingCreateDTO,
    ListingResponseDTO
)
from ..dtos.listing_dto import TopListingDTO

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
        status=listing.status,
        created_at=getattr(listing, "created_at", None)
    )


def listing_to_top_dto(
    listing,
    units_sold: int
):
    return TopListingDTO(
        listing_id=listing.id,
        title=listing.title,
        price=float(listing.price),
        category_id=listing.category_id,
        units_sold=units_sold,
        seller_id=listing.seller_id,
        description=listing.description,
        stock=listing.stock,
        status=listing.status,
        created_at=getattr(listing, "created_at", None)
    )