import hashlib
import hmac
import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select

from app.core.config import get_settings
from app.models import LoginAttempt, RefreshSession, Usuario
from app.rate_limit import limiter
from app.security import (
    DbSession,
    decode_token,
    encode_access_token,
    encode_refresh_token,
    get_current_user,
    require_roles,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=72)
    role: Literal["ADMIN", "OPERADOR_COE"]
    entity: Literal[
        "SNGR",
        "GAD_MUNICIPAL",
        "GAD_PROVINCIAL",
        "POLICIA_NACIONAL",
        "FUERZAS_ARMADAS",
        "BOMBEROS",
        "ECU_911",
        "MSP",
        "MIES",
        "MTOP",
    ] | None = None

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña excede el límite admitido.")
        return value


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


class LogoutRequest(BaseModel):
    refresh_token: str = Field(min_length=1)


def resolve_login_identifier(identifier: str) -> str:
    settings = get_settings()
    normalized = identifier.strip().lower()
    aliases = {
        "operador_coe": str(settings.coe_email).lower(),
        "admin_sistema": str(settings.admin_email).lower(),
    }
    return aliases.get(normalized, normalized)


def serialize_user(user: Usuario, entity: str | None = None) -> dict:
    return {
        "id": user.id,
        "nombre": user.nombre,
        "email": user.email,
        "rol": user.rol,
        "entidad": entity,
    }


async def issue_tokens(user: Usuario, session: DbSession, entity: str | None = None) -> dict:
    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_days)
    token_id = uuid.uuid4()
    session.add(RefreshSession(usuario_id=user.id, token_jti=token_id, expira_en=expires_at))
    await session.commit()
    return {
        "access_token": encode_access_token(user),
        "refresh_token": encode_refresh_token(user, token_id, expires_at),
        "token_type": "bearer",
        "expires_in": settings.access_token_minutes * 60,
        "usuario": serialize_user(user, entity),
    }


@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, body: LoginRequest, session: DbSession) -> dict:
    settings = get_settings()
    email = resolve_login_identifier(body.identifier)
    subject_hash = hmac.new(
        settings.jwt_secret.get_secret_value().encode("utf-8"),
        email.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    now = datetime.now(UTC)
    attempt = await session.scalar(
        select(LoginAttempt)
        .where(LoginAttempt.subject_hash == subject_hash)
        .with_for_update()
    )
    if attempt is not None and attempt.locked_until is not None and attempt.locked_until > now:
        raise HTTPException(status_code=423, detail="Acceso bloqueado por 5 minutos tras varios intentos fallidos.")

    user = await session.scalar(select(Usuario).where(Usuario.email == email).with_for_update())
    if (
        user is None
        or not user.activo
        or user.rol not in {"ADMIN", "OPERADOR_COE"}
        or user.rol != body.role
        or not verify_password(body.password, user.password_hash)
    ):
        if attempt is None:
            attempt = LoginAttempt(subject_hash=subject_hash, failed_attempts=0)
            session.add(attempt)
        attempt.failed_attempts += 1
        if attempt.failed_attempts >= 5:
            attempt.failed_attempts = 0
            attempt.locked_until = now + timedelta(minutes=5)
        attempt.updated_at = now
        await session.commit()
        if attempt.locked_until is not None and attempt.locked_until > now:
            raise HTTPException(status_code=423, detail="Acceso bloqueado por 5 minutos tras varios intentos fallidos.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas.")
    if attempt is not None:
        await session.delete(attempt)
        await session.flush()
    if body.role == "OPERADOR_COE" and body.entity is None:
        raise HTTPException(status_code=422, detail="Selecciona la entidad operativa COE.")
    if body.role == "ADMIN" and body.entity is not None:
        raise HTTPException(status_code=422, detail="El perfil administrativo no usa una entidad COE.")
    return await issue_tokens(user, session, body.entity)


@router.post("/refresh")
@limiter.limit("10/minute")
async def refresh(request: Request, body: RefreshRequest, session: DbSession) -> dict:
    payload = decode_token(body.refresh_token, refresh=True)
    try:
        user_id = int(payload["sub"])
        token_id = uuid.UUID(payload["jti"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de renovación inválido.") from exc

    token_session = await session.scalar(
        select(RefreshSession)
        .where(
            RefreshSession.usuario_id == user_id,
            RefreshSession.token_jti == token_id,
            RefreshSession.revocado_en.is_(None),
            RefreshSession.expira_en > datetime.now(UTC),
        )
        .with_for_update()
    )
    if token_session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de renovación revocado o expirado.")
    user = await session.scalar(select(Usuario).where(Usuario.id == user_id, Usuario.activo.is_(True)))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario inactivo o inexistente.")

    token_session.revocado_en = datetime.now(UTC)
    return await issue_tokens(user, session)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(body: LogoutRequest, session: DbSession) -> None:
    payload = decode_token(body.refresh_token, refresh=True)
    try:
        token_id = uuid.UUID(payload["jti"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de renovación inválido.") from exc
    token_session = await session.scalar(
        select(RefreshSession).where(
            RefreshSession.token_jti == token_id,
            RefreshSession.revocado_en.is_(None),
        )
    )
    if token_session is not None:
        token_session.revocado_en = datetime.now(UTC)
        await session.commit()


@router.get("/me")
async def me(user: Annotated[Usuario, Depends(get_current_user)]) -> dict:
    return serialize_user(user)


@router.get("/usuarios-demo")
async def demo_users(
    session: DbSession,
    _operator: Annotated[Usuario, Depends(require_roles("OPERADOR_COE", "ADMIN"))],
) -> list[dict]:
    users = (await session.scalars(select(Usuario).where(Usuario.activo.is_(True)).order_by(Usuario.id))).all()
    return [serialize_user(user) for user in users]
