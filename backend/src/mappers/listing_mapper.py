from src.db.models.listing_model import Listing
from src.dtos.listing_dto import (
    ListingCreateDTO,
    ListingResponseDTO
)
from ..dtos.listing_dto import TopListingDTO

LEGACY_IMAGE_URLS = {
    "/images/1.jpg": "/images/ece22ea1c4e4c9b338def32a2467271919dcc98ece78f6e54fa726b2e5d4cd07.jpg",
    "/images/2.jpg": "/images/9a8857012a44e9372a5b7cdee5afc68c6e0eb7ba024a8f8f36768d1a60298c1c.jpg",
    "/images/3.jpg": "/images/8f76e9fec5dca3253a079021fdb014ad4e280eebae26fa1e6e523a91fcfe721a.jpg",
    "/images/4.jpg": "/images/43f5810f07136f5255eb1dd09e6a0d864fc98ee938c61db95e438922f410f425.jpg",
    "/images/5.jpg": "/images/3ca0bfb42e10e4a1b6763b3e994807793006f88f8ee446bdc3c58265a4bd816a.jpg",
    "/images/6.jpg": "/images/5a67526958e76f86aab168c1a55f3011c0aad18e9c8b424dad105e48fac9ddba.jpg",
}

def normalize_image_url(image_url: str | None) -> str | None:
    return LEGACY_IMAGE_URLS.get(image_url, image_url)

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
    listing: Listing,
    seller_name: str | None = None,
    category_name: str | None = None
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
        created_at=getattr(listing, "created_at", None),
        image_url=normalize_image_url(getattr(listing, "image_url", None)),
        seller_name=seller_name,
        category_name=category_name
    )


def listing_to_top_dto(
    listing,
    units_sold: int,
    seller_name: str | None = None,
    category_name: str | None = None
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
        created_at=getattr(listing, "created_at", None),
        image_url=normalize_image_url(getattr(listing, "image_url", None)),
        seller_name=seller_name,
        category_name=category_name
    )