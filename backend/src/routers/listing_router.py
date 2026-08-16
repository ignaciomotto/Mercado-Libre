from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.connection import get_db
from ..schemas.listing_schema import ListingCreateSchema, ListingResponseSchema, ListingUpdate
from ..services.listing_service import ListingService


router = APIRouter(
    prefix="/listings",
    tags=["Listings"]
)


@router.post(
    "/",
    response_model=ListingResponseSchema,
    status_code=status.HTTP_201_CREATED
)
def create_listing(
    listing: ListingCreateSchema,
    db: Session = Depends(get_db)
):
    service = ListingService(db)

    return service.create_listing(listing)


@router.get(
    "/",
    response_model=list[ListingResponseSchema]
)
def get_listings(
    db: Session = Depends(get_db)
):
    service = ListingService(db)

    return service.get_listings()

@router.get("/search")
def filter_listings(
    search: str | None = None,
    category_id: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db)
):
    service = ListingService(db)

    return service.filter_listings(
        search=search,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price
    )

@router.get(
    "/{listing_id}",
    response_model=ListingResponseSchema
)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db)
):
    service = ListingService(db)

    listing = service.get_listing(listing_id)

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )

    return listing

@router.put(
    "/{listing_id}",
    response_model=ListingResponseSchema
)
def update_listing(
    listing_id: int,
    listing: ListingUpdate,
    db: Session = Depends(get_db)
):
    service = ListingService(db)

    updated_listing = service.update_listing(
        listing_id,
        listing
    )

    if not updated_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )

    return updated_listing


@router.delete(
    "/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db)
):
    service = ListingService(db)

    deleted = service.delete_listing(listing_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )

    return None