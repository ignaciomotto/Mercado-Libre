from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    String,
    func
)

from ..connection import Base
from sqlalchemy import UniqueConstraint

class Rating(Base):
    __tablename__ = "rating"

    __table_args__ = (
    UniqueConstraint(
        "purchase_id",
        "rater_id",
        "rated_id",
        name="unique_purchase_rating"
    ),
)

    id = Column(Integer, primary_key=True)

    purchase_id = Column(
        Integer,
        ForeignKey("purchase.id"),
        nullable=False
    )

    rater_id = Column(
        Integer,
        ForeignKey("User.id"),
        nullable=False
    )

    rated_id = Column(
        Integer,
        ForeignKey("User.id"),
        nullable=False
    )

    score = Column(
        Integer,
        nullable=False
    )

    comment = Column(
        String,
        nullable=True
    )

    date = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )