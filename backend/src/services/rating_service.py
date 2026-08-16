from sqlalchemy.orm import Session

from ..db.models.rating_model import Rating
from ..db.models.purchase_model import Purchase
from ..db.models.listing_model import Listing

from ..mappers.rating_mapper import (
    rating_to_schema,
    rating_create_to_model
)

from ..schemas.rating_schema import RatingCreateDTO

class RatingService:

    def __init__(self, db: Session):
        self.db = db

    def create_rating(
        self,
        purchase_id: int,
        rater_id: int,
        rating_data: RatingCreateDTO
    ):
        purchase = (
            self.db.query(Purchase)
            .filter(Purchase.id == purchase_id)
            .first()
        )

        if not purchase:
            raise ValueError(
                "La compra no existe"
            )

        if purchase.status != "Completed":
            raise ValueError(
                "Solo se pueden calificar compras finalizadas"
            )

        listing = (
            self.db.query(Listing)
            .filter(Listing.id == purchase.listing_id)
            .first()
        )

        if not listing:
            raise ValueError(
                "La publicación no existe"
            )

        buyer_id = purchase.buyer_id
        seller_id = listing.seller_id

        # Determinar a quién está calificando
        if rater_id == buyer_id:
            rated_id = seller_id

        elif rater_id == seller_id:
            rated_id = buyer_id

        else:
            raise ValueError(
                "El usuario no participa en esta compra"
            )

        # Verificar si ya calificó
        existing_rating = (
            self.db.query(Rating)
            .filter(
                Rating.purchase_id == purchase_id,
                Rating.rater_id == rater_id,
                Rating.rated_id == rated_id
            )
            .first()
        )

        if existing_rating:
            raise ValueError(
                "Ya calificaste a este usuario por esta compra"
            )

        rating = rating_create_to_model(
            purchase_id=purchase_id,
            rater_id=rater_id,
            rated_id=rated_id,
            score=rating_data.score,
            comment=rating_data.comment
        )

        self.db.add(rating)
        self.db.commit()
        self.db.refresh(rating)

        return rating_to_schema(rating)