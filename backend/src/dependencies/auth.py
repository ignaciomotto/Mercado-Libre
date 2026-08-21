from fastapi import Cookie, Depends, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session as DBSession

from ..db.connection import get_db
from ..db.models.user_model import User
from ..db.models.session_model import Session

def get_current_user(
    session_token: str | None = Cookie(default=None),
    db: DBSession = Depends(get_db)
):
    if not session_token:
        raise HTTPException(
            status_code=401,
            detail="No estás autenticado"
        )

    session = db.query(Session).filter(
        Session.token == session_token
    ).first()

    if not session:
        raise HTTPException(
            status_code=401,
            detail="Sesión inválida"
        )

    if session.expires_at < datetime.utcnow():
        db.delete(session)
        db.commit()

        raise HTTPException(
            status_code=401,
            detail="Sesión expirada"
        )

    user = db.query(User).filter(
        User.id == session.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Usuario no encontrado"
        )

    return user



# from fastapi import Cookie, Depends, HTTPException
# from sqlalchemy.orm import Session as DBSession

# from ..db.connection import get_db
# from ..db.models.session_model import Session
# from ..db.models.user_model import User


# def get_current_user(
#     session_token: str | None = Cookie(default=None),
#     db: DBSession = Depends(get_db)
# ):
#     print("================================")
#     print("TOKEN DE COOKIE:", session_token)

#     if not session_token:
#         print("NO LLEGÓ LA COOKIE")
#         raise HTTPException(
#             status_code=401,
#             detail="No estás autenticado"
#         )

#     session = (
#         db.query(Session)
#         .filter(Session.token == session_token)
#         .first()
#     )

#     print("SESSION ENCONTRADA:", session)

#     if not session:
#         print("NO EXISTE LA SESSION")
#         raise HTTPException(
#             status_code=401,
#             detail="Sesión inválida"
#         )

#     print("USER ID DE SESSION:", session.user_id)

#     user = (
#         db.query(User)
#         .filter(User.id == session.user_id)
#         .first()
#     )

#     print("USUARIO ENCONTRADO:", user)

#     if not user:
#         print("NO EXISTE EL USUARIO")
#         raise HTTPException(
#             status_code=401,
#             detail="Usuario no encontrado"
#         )

#     print("AUTENTICADO:", user.email)
#     print("================================")

#     return user