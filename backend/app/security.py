import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db import get_db_session
from app.models import Usuario

bearer_scheme = HTTPBearer(auto_error=False)
DbSession = Annotated[AsyncSession, Depends(get_db_session)]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("ascii")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("ascii"))
    except ValueError:
        return False


def encode_access_token(user: Usuario) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    return jwt.encode(
        {
            "sub": str(user.id),
            "rol": user.rol,
            "nombre": user.nombre,
            "tipo": "access",
            "iat": now,
            "exp": now + timedelta(minutes=settings.access_token_minutes),
            "jti": str(uuid.uuid4()),
        },
        settings.jwt_secret.get_secret_value(),
        algorithm="HS256",
    )


def encode_refresh_token(user: Usuario, token_id: uuid.UUID, expires_at: datetime) -> str:
    return jwt.encode(
        {
            "sub": str(user.id),
            "tipo": "refresh",
            "iat": datetime.now(UTC),
            "exp": expires_at,
            "jti": str(token_id),
        },
        get_settings().jwt_refresh_secret.get_secret_value(),
        algorithm="HS256",
    )


def decode_token(token: str, *, refresh: bool = False) -> dict:
    settings = get_settings()
    secret = settings.jwt_refresh_secret if refresh else settings.jwt_secret
    expected_type = "refresh" if refresh else "access"
    try:
        payload = jwt.decode(token, secret.get_secret_value(), algorithms=["HS256"])
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado.") from exc
    if payload.get("tipo") != expected_type:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Tipo de token inválido.")
    return payload


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: DbSession,
) -> Usuario:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Autenticación requerida.")
    payload = decode_token(credentials.credentials)
    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido.") from exc
    user = await session.scalar(select(Usuario).where(Usuario.id == user_id, Usuario.activo.is_(True)))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inactivo o inexistente.")
    return user


def require_roles(*roles: str):
    async def dependency(user: Annotated[Usuario, Depends(get_current_user)]) -> Usuario:
        if user.rol not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos para esta operación.")
        return user

    return dependency
