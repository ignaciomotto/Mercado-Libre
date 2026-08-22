from pathlib import Path
from hashlib import sha256
from shutil import copyfileobj

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..db.connection import get_db
from ..db.models.user_model import User
from ..db.models.listing_model import Listing
from ..schemas.listing_schema import ListingCreateSchema, ListingResponseSchema, ListingUpdate
from ..services.listing_service import ListingService

from ..dependencies.auth import get_current_user
from ..repositories.listing_repository import ListingRepository


router = APIRouter(
    prefix="/listings",
    tags=["Listings"]
)

IMAGES_DIR = Path(__file__).resolve().parents[2] / "images"
ALLOWED_IMAGE_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024
IMAGE_CHUNK_SIZE = 1024 * 1024


def _hashed_image_filename(image: UploadFile) -> str:
    digest = sha256()
    image.file.seek(0)
    while chunk := image.file.read(IMAGE_CHUNK_SIZE):
        digest.update(chunk)
    image.file.seek(0)
    return f"{digest.hexdigest()}{ALLOWED_IMAGE_TYPES[image.content_type]}"


@router.post(
    "/",
    response_model=ListingResponseSchema,
    status_code=status.HTTP_201_CREATED
)
def create_listing(
    listing: ListingCreateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (listing.seller_id, 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = ListingService(db)

    return service.create_listing(listing)


@router.post(
    "/{listing_id}/image",
    response_model=ListingResponseSchema
)
def upload_listing_image(
    listing_id: int,
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = ListingRepository.get_by_id(db, listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if current_user.id not in (listing.seller_id, 1):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated")
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solo se aceptan imágenes JPG, PNG o WEBP")

    image.file.seek(0, 2)
    size = image.file.tell()
    image.file.seek(0)
    if size > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="La imagen no puede superar 5 MB")

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    filename = _hashed_image_filename(image)
    destination = IMAGES_DIR / filename
    if not destination.exists():
        with destination.open("wb") as output:
            copyfileobj(image.file, output)

    listing.image_url = f"/images/{filename}"
    db.commit()
    db.refresh(listing)
    return listing


@router.get(
    "/",
    response_model=list[ListingResponseSchema]
)
def get_listings(
    db: Session = Depends(get_db)
):  
    service = ListingService(db)

    return service.get_listings()

@router.get("/search")
def filter_listings(
    search: str | None = None,
    category_id: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db)
):
    service = ListingService(db)

    return service.filter_listings(
        search=search,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price
    )

@router.get(
    "/{listing_id}",
    response_model=ListingResponseSchema
)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db)
):
    service = ListingService(db)

    listing = service.get_listing(listing_id)

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )

    return listing

@router.put(
    "/{listing_id}",
    response_model=ListingResponseSchema
)
def update_listing(
    listing_id: int,
    listing: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_listing = ListingRepository.get_by_id(db, listing_id)
    if not existing_listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if current_user.id not in (existing_listing.seller_id, 1):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permiso para editar esta publicación")
    
    service = ListingService(db)

    updated_listing = service.update_listing(
        listing_id,
        listing
    )

    return updated_listing


@router.delete(
    "/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.id in (ListingRepository.get_seller_id_by_listing_id(db, listing_id), 1):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    
    service = ListingService(db)

    deleted = service.delete_listing(listing_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )

    return None