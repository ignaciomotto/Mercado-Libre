from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from src.config.env import settings

DATABASE_URL = "postgresql+psycopg2://postgres:password@localhost:5432/MercadoLibre"

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def get_db():
    """Dependency de FastAPI: abre una sesión por request y la cierra al final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()