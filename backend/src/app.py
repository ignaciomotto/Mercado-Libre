from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from src.middlewares.error_middleware import app_error_handler
from src.routers import auth_router, user_router, listing_router, category_router, purchase_router, rating_router, question_router
from src.utils.errors import AppError

app = FastAPI(title="Initial Structure API")

IMAGES_DIR = Path(__file__).resolve().parents[1] / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)

app.include_router(auth_router.router, prefix="/api")
app.include_router(listing_router.router, prefix="/api")
app.include_router(category_router.router, prefix="/api")
app.include_router(user_router.router, prefix="/api")
app.include_router(purchase_router.router, prefix="/api")
app.include_router(rating_router.router, prefix="/api")
app.include_router(question_router.router, prefix="/api")
app.include_router(question_router.answer_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
