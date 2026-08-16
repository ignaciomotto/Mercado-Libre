from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db.models.user_model import User
from ..mappers.user_mapper import (
    user_create_to_model,
    user_to_response_dto
)
from ..schemas.user_schema import UserCreate, UserUpdate
from ..db.models.listing_model import Listing
from ..db.models.purchase_model import Purchase
from ..db.models.rating_model import Rating
from ..dtos.user_dto import TopSellerDTO
from ..mappers.listing_mapper import listing_to_response_dto
from ..mappers.purchase_mapper import purchase_to_history_dto


class UserService:

    def __init__(self, db: Session):
        self.db = db

    def get_users(self):
        users = self.db.query(User).all()

        return [
            user_to_response_dto(user)
            for user in users
        ]

    def get_user(self, user_id: int):
        user = (
            self.db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if not user:
            return None

        reputation = self.get_user_reputation(user_id)

        return user_to_response_dto(
            user,
            reputation
        )

    def get_user_listings(self, user_id: int):
        user = (
            self.db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if not user:
            return None

        listings = (
            self.db.query(Listing)
            .filter(Listing.seller_id == user_id)
            .all()
        )

        return [
            listing_to_response_dto(listing)
            for listing in listings
        ]

    def create_user(self, user_data: UserCreate):
        existing_user = (
            self.db.query(User)
            .filter(User.email == user_data.email)
            .first()
        )

        if existing_user:
            raise ValueError(
                "El email ya está registrado"
            )

        user = user_create_to_model(user_data)

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user_to_response_dto(user)

    def update_user(
        self,
        user_id: int,
        user_data: UserUpdate
    ):
        user = (
            self.db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if not user:
            return None

        update_data = user_data.model_dump(
            exclude_unset=True
        )

        if "email" in update_data:
            existing_user = (
                self.db.query(User)
                .filter(
                    User.email == update_data["email"],
                    User.id != user_id
                )
                .first()
            )

            if existing_user:
                raise ValueError(
                    "El email ya está registrado"
                )

        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)

        return user_to_response_dto(user)

    def delete_user(self, user_id: int):
        user = (
            self.db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if not user:
            return False

        self.db.delete(user)
        self.db.commit()

        return True

    def get_user_purchase_history(
        self,
        user_id: int,
        status: str | None = None
    ):
        user = (
            self.db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if not user:
            return None

        query = (
            self.db.query(Purchase)
            .filter(Purchase.buyer_id == user_id)
        )

        if status is not None:
            valid_statuses = {
                "Pending",
                "Cancelled",
                "Completed"
            }

            if status not in valid_statuses:
                raise ValueError(
                    "Invalid purchase status"
                )

            query = query.filter(
                Purchase.status == status
            )

        purchases = (
            query
            .order_by(Purchase.date.desc())
            .all()
        )

        result = []

        for purchase in purchases:
            listing = (
                self.db.query(Listing)
                .filter(
                    Listing.id == purchase.listing_id
                )
                .first()
            )

            if not listing:
                continue

            seller = (
                self.db.query(User)
                .filter(
                    User.id == listing.seller_id
                )
                .first()
            )

            if not seller:
                continue

            result.append(
                purchase_to_history_dto(
                    purchase,
                    listing,
                    seller
                )
            )

        return result

    def get_user_reputation(self, user_id: int):
        result = (
            self.db.query(
                func.count(Rating.id),
                func.avg(Rating.score)
            )
            .filter(Rating.rated_id == user_id)
            .first()
        )

        count, average = result

        if count < 3:
            return None

        return round(float(average), 2)

    def get_top_sellers(self):
        reputation_subquery = (
            self.db.query(
                Rating.rated_id.label("user_id"),
                func.avg(Rating.score).label("reputation"),
                func.count(Rating.id).label("rating_count")
            )
            .group_by(Rating.rated_id)
            .subquery()
        )

        sales_subquery = (
            self.db.query(
                Listing.seller_id.label("user_id"),
                func.count(Purchase.id).label("completed_sales")
            )
            .join(
                Purchase,
                Purchase.listing_id == Listing.id
            )
            .filter(
                Purchase.status == "Completed"
            )
            .group_by(Listing.seller_id)
            .subquery()
        )

        results = (
            self.db.query(
                User,
                reputation_subquery.c.reputation,
                sales_subquery.c.completed_sales
            )
            .join(
                reputation_subquery,
                reputation_subquery.c.user_id == User.id
            )
            .join(
                sales_subquery,
                sales_subquery.c.user_id == User.id
            )
            .filter(
                reputation_subquery.c.rating_count >= 3,
                sales_subquery.c.completed_sales >= 5
            )
            .order_by(
                reputation_subquery.c.reputation.desc(),
                sales_subquery.c.completed_sales.desc()
            )
            .limit(10)
            .all()
        )

        return [
            TopSellerDTO(
                id=user.id,
                name=user.name,
                email=user.email,
                reputation=round(float(reputation), 2),
                completed_sales=completed_sales
            )
            for user, reputation, completed_sales in results
        ]
    