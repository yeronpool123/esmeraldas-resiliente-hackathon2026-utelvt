from functools import lru_cache
from pathlib import Path

from pydantic import EmailStr, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    database_url: str
    jwt_secret: SecretStr
    jwt_refresh_secret: SecretStr
    admin_email: EmailStr
    admin_password: SecretStr
    coe_email: EmailStr
    coe_password: SecretStr
    cors_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:5173,http://127.0.0.1:5173"
    )
    access_token_minutes: int = 15
    refresh_token_days: int = 7
    seed_users_on_startup: bool = True
    demo_mode_enabled: bool = False

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("jwt_secret", "jwt_refresh_secret")
    @classmethod
    def validate_jwt_secret(cls, value: SecretStr) -> SecretStr:
        secret = value.get_secret_value()
        if len(secret) < 32 or "REEMPLAZAR" in secret or "CAMBIAR" in secret:
            raise ValueError("Los secretos JWT deben tener al menos 32 caracteres.")
        return value

    @field_validator("admin_password", "coe_password")
    @classmethod
    def validate_role_password(cls, value: SecretStr) -> SecretStr:
        password = value.get_secret_value()
        if (
            len(password) < 12
            or len(password.encode("utf-8")) > 72
            or password.startswith("CAMBIAR")
        ):
            raise ValueError("Las claves institucionales deben tener 12-72 bytes y configurarse localmente.")
        return value

    @model_validator(mode="after")
    def validate_distinct_jwt_secrets(self):
        if self.jwt_secret.get_secret_value() == self.jwt_refresh_secret.get_secret_value():
            raise ValueError("JWT_SECRET y JWT_REFRESH_SECRET deben ser diferentes.")
        if str(self.admin_email).lower() == str(self.coe_email).lower():
            raise ValueError("ADMIN_EMAIL y COE_EMAIL deben ser diferentes.")
        if self.admin_password.get_secret_value() == self.coe_password.get_secret_value():
            raise ValueError("Las claves de ADMIN y COE deben ser diferentes.")
        return self

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        if not value.startswith("postgresql+asyncpg://"):
            raise ValueError("DATABASE_URL debe usar el driver postgresql+asyncpg.")
        return value

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
