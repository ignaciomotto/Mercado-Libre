from sqlalchemy import Column, Integer, String, func, ForeignKey
from sqlalchemy.orm import relationship

from src.db.connection import Base

class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    parent_id = Column(
        Integer,
        ForeignKey("category.id"),
        nullable=True
    )

    parent = relationship(
        "Category",
        remote_side=[id],
        back_populates="children"
    )

    children = relationship(
        "Category",
        back_populates="parent"
    )