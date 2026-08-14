from sqlalchemy import Column, Integer, String, DateTime, func

from src.db.connection import Base

class Question(Base):
    __tablename__ = "question"

    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, nullable=False)
    author_id = Column(Integer, nullable=False)
    text = Column(String, nullable=False)
    registration_date = Column(DateTime, server_default=func.now())