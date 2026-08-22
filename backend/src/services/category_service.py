from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db.models.listing_model import Listing
from ..db.models.category_model import Category
from ..db.models.purchase_model import Purchase
from ..mappers.listing_mapper import listing_to_top_dto
from ..mappers.category_mapper import (
    category_create_to_model,
    category_to_response_dto,
    category_to_tree_dto
)
from ..db.models.user_model import User
from ..schemas.category_schema import CategoryCreate, CategoryUpdate


class CategoryService:

    def __init__(self, db: Session):
        self.db = db

    def get_categories(self):
        categories = self.db.query(Category).all()

        return [
            category_to_response_dto(category)
            for category in categories
        ]

    def get_category_ids(self, category_id: int):
        category_ids = [category_id]

        children = (
            self.db.query(Category)
            .filter(Category.parent_id == category_id)
            .all()
        )

        for child in children:
            category_ids.extend(
                self.get_category_ids(child.id)
            )

        return category_ids

    def get_category(self, category_id: int):
        category = (
            self.db.query(Category)
            .filter(Category.id == category_id)
            .first()
        )

        if not category:
            return None

        return category_to_response_dto(category)

    def get_category_tree(self):
        categories = (
            self.db.query(Category)
            .filter(Category.parent_id.is_(None))
            .all()
        )

        return [
            category_to_tree_dto(category)
            for category in categories
        ]

    def validate_parent(
        self,
        category_id: int | None,
        parent_id: int | None
    ):
        if parent_id is None:
            return

        if category_id == parent_id:
            raise ValueError(
                "Una categoría no puede ser padre de sí misma"
            )

        parent = (
            self.db.query(Category)
            .filter(Category.id == parent_id)
            .first()
        )

        if not parent:
            raise ValueError(
                "La categoría padre no existe"
            )

        current = parent

        while current is not None:

            if current.id == category_id:
                raise ValueError(
                    "No se puede crear un ciclo en las categorías"
                )

            if current.parent_id is None:
                break

            current = (
                self.db.query(Category)
                .filter(Category.id == current.parent_id)
                .first()
            )

    def create_category(
        self,
        category_data: CategoryCreate
    ):
        self.validate_parent(
            None,
            category_data.parent_id
        )

        category = category_create_to_model(category_data)

        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)

        return category_to_response_dto(category)

    def update_category(
        self,
        category_id: int,
        category_data: CategoryUpdate
    ):
        category = (
            self.db.query(Category)
            .filter(Category.id == category_id)
            .first()
        )

        if not category:
            return None

        update_data = category_data.model_dump(
            exclude_unset=True
        )

        if "parent_id" in update_data:
            self.validate_parent(
                category_id,
                update_data["parent_id"]
            )

        for field, value in update_data.items():
            setattr(category, field, value)

        self.db.commit()
        self.db.refresh(category)

        return category_to_response_dto(category)

    def delete_category(self, category_id: int):
        category = (
            self.db.query(Category)
            .filter(Category.id == category_id)
            .first()
        )

        if not category:
            return False

        # Las publicaciones pasarán al padre de la categoría eliminada.
        new_category_id = category.parent_id

        # Obtener recursivamente todas las categorías
        # que se van a eliminar.
        category_ids = self.get_category_ids(category_id)

        # Reubicar las publicaciones de todas esas categorías.
        listings = (
            self.db.query(Listing)
            .filter(Listing.category_id.in_(category_ids))
            .all()
        )

        for listing in listings:
            listing.category_id = new_category_id

        # Eliminar todas las categorías.
        categories = (
            self.db.query(Category)
            .filter(Category.id.in_(category_ids))
            .all()
        )

        for category_to_delete in categories:
            self.db.delete(category_to_delete)

        self.db.commit()

        return True

    def get_top_listings(self, category_id: int):
        category = (
            self.db.query(Category)
            .filter(Category.id == category_id)
            .first()
        )

        if not category:
            return None

        category_ids = self.get_category_ids(category_id)

        results = (
            self.db.query(
                Listing,
                func.sum(Purchase.quantity).label("units_sold")
            )
            .join(
                Purchase,
                Purchase.listing_id == Listing.id
            )
            .filter(
                Listing.category_id.in_(category_ids),
                Purchase.status == "Completed"
            )
            .group_by(Listing.id)
            .order_by(
                func.sum(Purchase.quantity).desc()
            )
            .limit(5)
            .all()
        )

        return [
            listing_to_top_dto(
                listing,
                int(units_sold),
                self.db.query(User.name).filter(User.id == listing.seller_id).scalar(),
                self.db.query(Category.name).filter(Category.id == listing.category_id).scalar()
            )
            for listing, units_sold in results
        ]