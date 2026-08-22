from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timedelta

from ..db.models.session_model import Session as Session_User
from ..db.connection import get_db
from ..db.models.user_model import User
from ..schemas.user_schema import UserResponse
from ..dependencies.auth import get_current_user
from ..services.user_service import UserService
from ..utils.hash import verify_password

router = APIRouter()

@router.get(
    "/whoami",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return UserService(db).get_user(current_user.id)

@router.post("/login")
def login(
    email: str,
    password: str,
    response: Response,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

    if not (verify_password(password, user.password) if user.password.startswith("$pbkdf2") else user.password == password):
        raise HTTPException(
            status_code=401,
            detail="Credenciales incorrectas"
        )

    token = secrets.token_urlsafe(32)

    session = Session_User(
        token=token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    db.add(session)
    db.commit()

    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=False,  # True cuando uses HTTPS
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )

    return {
        "message": "Login correcto"
    }

@router.post("/logout")
def logout(
    response: Response,
    session_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db)
):
    if session_token:
        session = db.query(Session_User).filter(
            Session_User.token == session_token
        ).first()

        if session:
            db.delete(session)
            db.commit()

    response.delete_cookie("session_token")

    return {
        "message": "Logout correcto"
    }