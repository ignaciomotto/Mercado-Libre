from sqlalchemy import Column, Integer, String, func

from src.db.connection import Base

class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, nullable=True)