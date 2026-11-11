import uuid
from datetime import datetime, timedelta
from types import SimpleNamespace
from typing import Self
from zoneinfo import ZoneInfo

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.db import get_db_session
from app.main import app
from app.routers.public import PublicSOSCreate


def test_public_config_exposes_demo_mode_as_boolean() -> None:
    with TestClient(app) as client:
        response = client.get("/api/public/config")

    assert response.status_code == 200
    assert isinstance(response.json()["demo_mode_enabled"], bool)


def test_exact_public_sos_coordinates_require_institutional_authentication() -> None:
    with TestClient(app) as client:
        response = client.get("/api/public/sos/exact")

    assert response.status_code == 401


def test_public_sos_validates_coordinates_and_carries_only_reported_facts() -> None:
    payload = PublicSOSCreate(
        uuid_cliente=uuid.uuid4(),
        tipo_evento="INUNDACION",
        descripcion="Agua ingresando a la vivienda.",
        lat=0.9592,
        lng=-79.6539,
        gps_accuracy_m=14.5,
        capturado_en_dispositivo="2026-11-10T10:00:00-05:00",
    )

    assert payload.tipo_evento == "INUNDACION"
    assert payload.lat == 0.9592
    assert payload.gps_accuracy_m == 14.5
    assert payload.demo_mode is False


@pytest.mark.parametrize(
    ("latitude", "longitude"),
    [(91, -79.65), (0.95, 181), (-90.01, 0), (0, -180.01)],
)
def test_public_sos_rejects_out_of_range_coordinates(latitude: float, longitude: float) -> None:
    with pytest.raises(ValidationError):
        PublicSOSCreate(
            uuid_cliente=uuid.uuid4(),
            tipo_evento="ASISTENCIA",
            lat=latitude,
            lng=longitude,
            capturado_en_dispositivo="2026-11-10T10:00:00Z",
        )


def test_demo_sos_is_rejected_when_server_demo_mode_is_disabled(monkeypatch: pytest.MonkeyPatch) -> None:
    async def override_session():
        yield object()

    monkeypatch.setattr("app.routers.public.get_settings", lambda: SimpleNamespace(demo_mode_enabled=False))
    app.dependency_overrides[get_db_session] = override_session
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/public/sos",
                json={
                    "uuid_cliente": str(uuid.uuid4()),
                    "tipo_evento": "ASISTENCIA",
                    "lat": 0.9592,
                    "lng": -79.6539,
                    "capturado_en_dispositivo": "2026-11-10T10:00:00-05:00",
                    "demo_mode": True,
                },
            )
    finally:
        app.dependency_overrides.pop(get_db_session, None)

    assert response.status_code == 403
    assert "DEMO" in response.json()["detail"]


def test_weather_forecast_uses_only_current_and_future_hours(monkeypatch: pytest.MonkeyPatch) -> None:
    timezone = ZoneInfo("America/Guayaquil")
    current_hour = datetime.now(timezone).replace(minute=0, second=0, microsecond=0)
    forecast_times = [
        (current_hour + timedelta(hours=offset)).strftime("%Y-%m-%dT%H:00")
        for offset in range(-1, 14)
    ]
    upstream_payload = {
        "latitude": 0.95,
        "longitude": -79.66,
        "timezone": "America/Guayaquil",
        "hourly": {
            "time": forecast_times,
            "precipitation_probability": list(range(15)),
            "temperature_2m": [25.0] * 15,
            "precipitation": [0.0] * 15,
            "weather_code": [3] * 15,
        },
    }

    class FakeResponse:
        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict:
            return upstream_payload

    class FakeAsyncClient:
        def __init__(self, timeout: float) -> None:
            self.timeout = timeout

        async def __aenter__(self) -> Self:
            return self

        async def __aexit__(self, *_args) -> None:
            return None

        async def get(self, _url: str, params: dict) -> FakeResponse:
            assert params["models"] == "best_match"
            return FakeResponse()

    monkeypatch.setattr("app.routers.public.httpx.AsyncClient", FakeAsyncClient)
    with TestClient(app) as client:
        response = client.get("/api/public/weather?latitude=0.95&longitude=-79.66")

    assert response.status_code == 200
    data = response.json()
    assert len(data["hours"]) == 12
    latest_current_hour = datetime.now(timezone).replace(minute=0, second=0, microsecond=0).strftime("%Y-%m-%dT%H:00")
    assert data["hours"][0]["time"] >= latest_current_hour
    assert response.headers["cache-control"] == "no-store"
