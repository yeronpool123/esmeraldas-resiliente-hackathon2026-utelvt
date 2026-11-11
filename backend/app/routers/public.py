import uuid
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import Annotated, Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from geoalchemy2.elements import WKTElement
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.core.config import get_settings
from app.models import Auditoria, IncidenteEmergencia, Usuario, ZonaRiesgo
from app.rate_limit import limiter
from app.realtime import operations_hub
from app.security import DbSession, require_roles

router = APIRouter(prefix="/api/public", tags=["Servicios públicos"])
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
SOS_EVENT_TYPES = {"ASISTENCIA", "INUNDACION", "DESLIZAMIENTO", "INCENDIO", "OTRA"}


class PublicSOSCreate(BaseModel):
    uuid_cliente: uuid.UUID
    tipo_evento: Literal["ASISTENCIA", "INUNDACION", "DESLIZAMIENTO", "INCENDIO", "OTRA"]
    descripcion: str = Field(default="", max_length=280)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    gps_accuracy_m: float | None = Field(default=None, ge=0, le=10000)
    capturado_en_dispositivo: datetime
    demo_mode: bool = False


def _serialize_sos(incident: IncidenteEmergencia, zone_name: str | None, lat: float, lng: float) -> dict:
    return {
        "id": incident.id,
        "uuid_cliente": str(incident.uuid_cliente),
        "tipo_evento": incident.tipo_evento,
        "categoria_sos": incident.categoria_sos,
        "gravedad": incident.gravedad,
        "estado": incident.estado,
        "descripcion": incident.descripcion,
        "zona_riesgo_nombre": zone_name,
        "verificado": incident.verificado,
        "es_simulacion": incident.es_simulacion,
        "gps_accuracy_m": float(incident.gps_accuracy_m) if incident.gps_accuracy_m is not None else None,
        "ubicacion": [lat, lng],
        "creado_en": incident.creado_en.isoformat(),
        "capturado_en_dispositivo": (
            incident.capturado_en_dispositivo.isoformat()
            if incident.capturado_en_dispositivo is not None
            else None
        ),
        "radio_afectacion_m": None,
        "ubicacion_aproximada": False,
    }


@router.get("/config")
async def public_config() -> dict:
    return {"demo_mode_enabled": get_settings().demo_mode_enabled}


@router.get("/sos")
async def list_public_sos(
    session: DbSession,
    response: Response,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[dict]:
    response.headers["Cache-Control"] = "no-store"
    query = (
        select(
            IncidenteEmergencia,
            ZonaRiesgo.nombre_sector,
            func.ST_Y(IncidenteEmergencia.ubicacion_geom).label("lat"),
            func.ST_X(IncidenteEmergencia.ubicacion_geom).label("lng"),
        )
        .outerjoin(ZonaRiesgo, IncidenteEmergencia.zona_riesgo_id == ZonaRiesgo.id)
        .where(
            IncidenteEmergencia.tipo_evento == "SOS_CIUDADANO",
            IncidenteEmergencia.estado.in_(("PENDIENTE", "EN_PROCESO")),
            IncidenteEmergencia.creado_en >= datetime.now(UTC) - timedelta(hours=24),
        )
        .order_by(IncidenteEmergencia.creado_en.desc())
        .limit(limit)
    )
    records = (await session.execute(query)).all()
    return [
        {
            **_serialize_sos(
            incident,
            zone_name,
            round(float(lat), 3),
            round(float(lng), 3),
            ),
            "ubicacion_aproximada": True,
        }
        for incident, zone_name, lat, lng in records
    ]


@router.get("/sos/exact")
async def list_exact_sos(
    session: DbSession,
    _user: Annotated[Usuario, Depends(require_roles("OPERADOR_COE", "ADMIN"))],
    response: Response,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[dict]:
    response.headers["Cache-Control"] = "no-store"
    query = (
        select(
            IncidenteEmergencia,
            ZonaRiesgo.nombre_sector,
            func.ST_Y(IncidenteEmergencia.ubicacion_geom).label("lat"),
            func.ST_X(IncidenteEmergencia.ubicacion_geom).label("lng"),
        )
        .outerjoin(ZonaRiesgo, IncidenteEmergencia.zona_riesgo_id == ZonaRiesgo.id)
        .where(
            IncidenteEmergencia.tipo_evento == "SOS_CIUDADANO",
            IncidenteEmergencia.estado.in_(("PENDIENTE", "EN_PROCESO")),
            IncidenteEmergencia.creado_en >= datetime.now(UTC) - timedelta(hours=24),
        )
        .order_by(IncidenteEmergencia.creado_en.desc())
        .limit(limit)
    )
    records = (await session.execute(query)).all()
    return [
        _serialize_sos(incident, zone_name, float(lat), float(lng))
        for incident, zone_name, lat, lng in records
    ]


@router.post("/sos", status_code=status.HTTP_201_CREATED)
@limiter.limit("3/5minutes")
async def create_public_sos(
    request: Request,
    body: PublicSOSCreate,
    session: DbSession,
    response: Response,
) -> dict:
    response.headers["Cache-Control"] = "no-store"
    settings = get_settings()
    if body.demo_mode and not settings.demo_mode_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El modo DEMO está desactivado en el servidor.",
        )
    if body.tipo_evento not in SOS_EVENT_TYPES:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Tipo de SOS inválido.")

    existing_row = (
        await session.execute(
            select(
                IncidenteEmergencia,
                ZonaRiesgo.nombre_sector,
                func.ST_Y(IncidenteEmergencia.ubicacion_geom).label("lat"),
                func.ST_X(IncidenteEmergencia.ubicacion_geom).label("lng"),
            )
            .outerjoin(ZonaRiesgo, IncidenteEmergencia.zona_riesgo_id == ZonaRiesgo.id)
            .where(IncidenteEmergencia.uuid_cliente == body.uuid_cliente)
        )
    ).first()
    existing = existing_row[0] if existing_row is not None else None
    if existing is not None:
        if existing.tipo_evento != "SOS_CIUDADANO":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El identificador ya pertenece a otro reporte.")
        response.status_code = status.HTTP_200_OK
        return _serialize_sos(
            existing,
            existing_row[1],
            float(existing_row[2]),
            float(existing_row[3]),
        )

    point = func.ST_SetSRID(func.ST_MakePoint(body.lng, body.lat), 4326)
    zone_id = await session.scalar(
        select(ZonaRiesgo.id)
        .where(func.ST_Within(point, ZonaRiesgo.poligono_geom))
        .order_by(ZonaRiesgo.id)
        .limit(1)
    )
    statement = (
        insert(IncidenteEmergencia)
        .values(
            uuid_cliente=body.uuid_cliente,
            fuente_origen="DATO_SIMULADO" if body.demo_mode else "REPORTE_CIUDADANO",
            tipo_evento="SOS_CIUDADANO",
            categoria_sos=body.tipo_evento,
            gravedad="CRITICA",
            estado="PENDIENTE",
            personas_afectadas=0,
            descripcion=body.descripcion.strip() or f"Solicitud de ayuda · {body.tipo_evento.lower()}",
            zona_riesgo_id=zone_id,
            verificado=False,
            es_simulacion=body.demo_mode,
            gps_accuracy_m=Decimal(str(body.gps_accuracy_m)) if body.gps_accuracy_m is not None else None,
            capturado_en_dispositivo=body.capturado_en_dispositivo,
            ubicacion_geom=WKTElement(f"POINT({body.lng} {body.lat})", srid=4326),
        )
        .on_conflict_do_nothing(index_elements=[IncidenteEmergencia.uuid_cliente])
        .returning(IncidenteEmergencia.id)
    )
    incident_id = await session.scalar(statement)
    if incident_id is None:
        duplicate = (
            await session.execute(
                select(
                    IncidenteEmergencia,
                    ZonaRiesgo.nombre_sector,
                    func.ST_Y(IncidenteEmergencia.ubicacion_geom).label("lat"),
                    func.ST_X(IncidenteEmergencia.ubicacion_geom).label("lng"),
                )
                .outerjoin(ZonaRiesgo, IncidenteEmergencia.zona_riesgo_id == ZonaRiesgo.id)
                .where(IncidenteEmergencia.uuid_cliente == body.uuid_cliente)
            )
        ).first()
        if duplicate is None or duplicate[0].tipo_evento != "SOS_CIUDADANO":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El identificador ya pertenece a otro reporte.")
        response.status_code = status.HTTP_200_OK
        return _serialize_sos(duplicate[0], duplicate[1], float(duplicate[2]), float(duplicate[3]))

    incident = await session.get(IncidenteEmergencia, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo recuperar el SOS recién creado.")
    session.add(
        Auditoria(
            usuario_id=None,
            accion="SOS_CIUDADANO_RECIBIDO",
            entidad="INCIDENTES",
            entidad_id=incident.id,
            detalle={
                "fuente_origen": incident.fuente_origen,
                "es_simulacion": incident.es_simulacion,
                "verificado": False,
            },
        )
    )
    await session.commit()
    await session.refresh(incident)
    await operations_hub.broadcast(
        "incidente_creado",
        {
            "id": incident.id,
            "tipo_evento": incident.tipo_evento,
            "gravedad": incident.gravedad,
            "fuente_origen": incident.fuente_origen,
            "verificado": False,
            "es_simulacion": incident.es_simulacion,
            "lat": body.lat,
            "lng": body.lng,
            "zona_riesgo_id": zone_id,
        },
    )
    return _serialize_sos(incident, None, body.lat, body.lng)


@router.get("/weather")
@limiter.limit("30/minute")
async def weather_forecast(
    request: Request,
    response: Response,
    latitude: Annotated[float, Query(ge=-90, le=90)],
    longitude: Annotated[float, Query(ge=-180, le=180)],
) -> dict:
    response.headers["Cache-Control"] = "no-store"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "temperature_2m,precipitation_probability,precipitation,weather_code",
        "forecast_days": 2,
        "timezone": "auto",
        "models": "best_match",
    }
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            upstream = await client.get(WEATHER_URL, params=params)
            upstream.raise_for_status()
            payload = upstream.json()
    except (httpx.HTTPError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo consultar el pronóstico meteorológico externo.",
        ) from error

    hourly = payload.get("hourly")
    if not isinstance(hourly, dict):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="El proveedor devolvió un pronóstico incompleto.")
    timezone_name = payload.get("timezone")
    if not isinstance(timezone_name, str):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="El proveedor no indicó la zona horaria del pronóstico.")
    try:
        local_now = datetime.now(ZoneInfo(timezone_name)).replace(minute=0, second=0, microsecond=0)
    except ZoneInfoNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="El proveedor devolvió una zona horaria inválida.") from error
    current_hour = local_now.strftime("%Y-%m-%dT%H:00")
    times = hourly.get("time")
    probabilities = hourly.get("precipitation_probability")
    temperatures = hourly.get("temperature_2m")
    amounts = hourly.get("precipitation")
    codes = hourly.get("weather_code")
    if not all(isinstance(value, list) for value in (times, probabilities, temperatures, amounts, codes)):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="El proveedor devolvió datos meteorológicos inválidos.")

    hours = []
    for index in range(min(len(times), len(probabilities), len(temperatures), len(amounts), len(codes))):
        if not isinstance(times[index], str) or times[index] < current_hour:
            continue
        hours.append(
            {
                "time": times[index],
                "precipitation_probability": probabilities[index],
                "temperature_c": temperatures[index],
                "precipitation_mm": amounts[index],
                "weather_code": codes[index],
            }
        )
        if len(hours) == 12:
            break
    return {
        "latitude": payload.get("latitude"),
        "longitude": payload.get("longitude"),
        "timezone": timezone_name,
        "fetched_at": datetime.now(UTC).isoformat(),
        "provider": "Open-Meteo",
        "model": "best_match (modelo meteorológico externo)",
        "probability_basis": "Probabilidad de precipitación del proveedor; no es una predicción entrenada por esta aplicación.",
        "hours": hours,
    }
