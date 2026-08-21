from sqlalchemy import Column, Integer, String, DateTime, func

from src.db.connection import Base

class Answer(Base):
    __tablename__ = "answer"

    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, nullable=False, unique=True)
    text = Column(String, nullable=False)
    date = Column(DateTime, server_default=func.now())