import asyncio
from datetime import UTC, datetime

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.db import get_db_session
from app.main import app
from app.models import LoginAttempt, Usuario
from app.routers.auth import LoginRequest, resolve_login_identifier
from app.routers.shelters import OccupancyChange
from app.security import (
    decode_token,
    encode_access_token,
    hash_password,
    require_roles,
    verify_password,
)


def test_password_hash_verification() -> None:
    password_hash = hash_password("ValidDemoPassword123")

    assert password_hash != "ValidDemoPassword123"
    assert verify_password("ValidDemoPassword123", password_hash)
    assert not verify_password("IncorrectPassword", password_hash)

def test_login_accepts_role_and_resolves_institutional_alias() -> None:
    request = LoginRequest(
        identifier=" operador_coe ",
        password="ValidInstitutionalPassword123",
        role="OPERADOR_COE",
        entity="ECU_911",
    )

    assert resolve_login_identifier(request.identifier) == "coe@test.example"
    assert request.entity == "ECU_911"


def test_login_rejects_unknown_coe_entity() -> None:
    with pytest.raises(ValidationError):
        LoginRequest(
            identifier="operador_coe",
            password="ValidInstitutionalPassword123",
            role="OPERADOR_COE",
            entity="UNKNOWN",
        )


def test_login_rejects_unrecognized_role() -> None:
    with pytest.raises(ValidationError):
        LoginRequest(identifier="user@example.test", password="any-password", role="CIUDADANO")


def test_five_failed_logins_block_identifier_for_five_minutes() -> None:
    class FakeAuthSession:
        attempt: LoginAttempt | None = None

        async def scalar(self, statement):
            if "login_attempts" in str(statement):
                return self.attempt
            return None

        def add(self, value) -> None:
            if isinstance(value, LoginAttempt):
                self.attempt = value

        async def commit(self) -> None:
            return None

    session = FakeAuthSession()

    async def override_session():
        yield session

    app.dependency_overrides[get_db_session] = override_session
    try:
        with TestClient(app) as client:
            responses = [
                client.post(
                    "/api/auth/login",
                    json={
                        "identifier": "lockout-test@example.test",
                        "password": "WrongPassword",
                        "role": "ADMIN",
                    },
                )
                for _ in range(5)
            ]
    finally:
        app.dependency_overrides.pop(get_db_session, None)

    assert [response.status_code for response in responses] == [401, 401, 401, 401, 423]
    assert session.attempt is not None
    assert session.attempt.locked_until is not None
    assert session.attempt.locked_until > datetime.now(UTC)


def test_access_token_contains_expected_subject_and_role() -> None:
    user = Usuario(id=17, nombre="Operador", email="operador@example.test", rol="OPERADOR_COE")

    payload = decode_token(encode_access_token(user))

    assert payload["sub"] == "17"
    assert payload["rol"] == "OPERADOR_COE"
    assert payload["tipo"] == "access"


def test_role_dependency_rejects_unprivileged_user() -> None:
    dependency = require_roles("ADMIN")
    citizen = Usuario(id=3, nombre="Ciudadano", email="ciudadano@example.test", rol="CIUDADANO")

    with pytest.raises(HTTPException) as error:
        asyncio.run(dependency(citizen))

    assert error.value.status_code == 403


def test_incident_endpoint_requires_authentication() -> None:
    with TestClient(app) as client:
        response = client.get("/api/incidentes")

    assert response.status_code == 401


def test_shelter_occupancy_change_must_be_nonzero() -> None:
    with pytest.raises(ValidationError):
        OccupancyChange(delta=0)
