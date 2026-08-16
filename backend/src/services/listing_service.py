from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..db.models.listing_model import Listing
from ..db.models.category_model import Category
from ..schemas.listing_schema import ListingCreateSchema, ListingUpdate
from ..mappers.listing_mapper import listing_create_to_model, listing_to_response_dto

class ListingService:

    def __init__(self, db: Session):
        self.db = db

    def get_listings(self):
        listings = self.db.query(Listing).all()

        return [
            listing_to_response_dto(listing)
            for listing in listings
        ]

    def get_listing(self, listing_id: int):
        listing = (
            self.db.query(Listing)
            .filter(Listing.id == listing_id)
            .first()
        )

        if not listing:
            return None

        return listing_to_response_dto(listing)

    def create_listing(self, listing_data: ListingCreateSchema):
        listing = listing_create_to_model(listing_data)

        self.db.add(listing)
        self.db.commit()
        self.db.refresh(listing)

        return listing_to_response_dto(listing)

    def update_listing(
        self,
        listing_id: int,
        listing_data: ListingUpdate
    ):
        listing = (
            self.db.query(Listing)
            .filter(Listing.id == listing_id)
            .first()
        )

        if not listing:
            return None

        update_data = listing_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(listing, field, value)

        self.db.commit()
        self.db.refresh(listing)

        return listing_to_response_dto(listing)

    def delete_listing(self, listing_id: int):
        listing = (
            self.db.query(Listing)
            .filter(Listing.id == listing_id)
            .first()
        )

        if not listing:
            return False

        self.db.delete(listing)
        self.db.commit()

        return True

    def get_category_ids(self, category_id: int):
        category_ids = [category_id]

        categories = (
            self.db.query(Category)
            .filter(Category.parent_id == category_id)
            .all()
        )

        for category in categories:
            category_ids.extend(
                self.get_category_ids(category.id)
            )

        return category_ids

    def filter_listings(
        self,
        search: str | None = None,
        category_id: int | None = None,
        min_price: float | None = None,
        max_price: float | None = None
    ):
        query = (
            self.db.query(Listing)
            .filter(Listing.status == "Active")
        )

        if search:
            query = query.filter(
                or_(
                    Listing.title.ilike(f"%{search}%"),
                    Listing.description.ilike(f"%{search}%")
                )
            )

        if category_id is not None:
            category_ids = self.get_category_ids(category_id)

            query = query.filter(
                Listing.category_id.in_(category_ids)
            )

        if min_price is not None:
            query = query.filter(
                Listing.price >= min_price
            )

        if max_price is not None:
            query = query.filter(
                Listing.price <= max_price
            )

        listings = query.all()

        return [
            listing_to_response_dto(listing)
            for listing in listings
        ]