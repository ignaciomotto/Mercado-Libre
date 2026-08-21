from sqlalchemy import Column, Integer, String, DateTime
from src.db.connection import Base

class Session(Base):
    __tablename__ = "session"

    id = Column(Integer, primary_key=True)
    token = Column(String, unique=True, nullable=False)
    user_id = Column(Integer, nullable=False)
    expires_at = Column(DateTime, nullable=False)