from sqlalchemy.orm import Session

from ..db.models.listing_model import Listing


class ListingRepository:

    @staticmethod
    def get_by_id(
        db: Session,
        listing_id: int
    ):
        return (
            db.query(Listing)
            .filter(Listing.id == listing_id)
            .first()
        )

    @staticmethod
    def get_seller_id_by_listing_id(
        db: Session,
        listing_id: int
    ):
        result = (
            db.query(Listing.seller_id)
            .filter(Listing.id == listing_id)
            .first()
        )

        if not result:
            return None

        return result[0]