import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from geoalchemy2.elements import WKTElement
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.models import Auditoria, IncidenteEmergencia, Usuario, ZonaRiesgo
from app.realtime import operations_hub
from app.security import DbSession, get_current_user, require_roles

router = APIRouter(prefix="/api/incidentes", tags=["Incidentes"])
ESTADOS = {"PENDIENTE", "EN_PROCESO", "ATENDIDO", "DESCARTADO"}
GRAVEDADES = {"BAJA", "MEDIA", "ALTA", "CRITICA"}


class IncidentCreate(BaseModel):
    uuid_cliente: uuid.UUID
    tipo_evento: str = Field(min_length=2, max_length=80)
    gravedad: str
    descripcion: str = Field(min_length=1, max_length=500)
    personas_afectadas: int = Field(default=0, ge=0, le=100000)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    foto_url: str | None = Field(default=None, max_length=500)


class IncidentStateUpdate(BaseModel):
    estado: str


@router.get("")
async def list_incidents(
    session: DbSession,
    user: Annotated[Usuario, Depends(get_current_user)],
    gravedad: Annotated[str | None, Query()] = None,
    estado: Annotated[str | None, Query()] = None,
    fuente: Annotated[str | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> list[dict]:
    query = select(
        IncidenteEmergencia,
        ZonaRiesgo.nombre_sector,
        func.ST_Y(IncidenteEmergencia.ubicacion_geom).label("lat"),
        func.ST_X(IncidenteEmergencia.ubicacion_geom).label("lng"),
    ).outerjoin(ZonaRiesgo, IncidenteEmergencia.zona_riesgo_id == ZonaRiesgo.id)
    query = query.order_by(IncidenteEmergencia.creado_en.desc()).limit(limit)
    if user.rol == "CIUDADANO":
        query = query.where(IncidenteEmergencia.reportado_por == user.id)
    if gravedad:
        if gravedad not in GRAVEDADES:
            raise HTTPException(status_code=422, detail="Nivel de gravedad inválido.")
        query = query.where(IncidenteEmergencia.gravedad == gravedad)
    if estado:
        if estado not in ESTADOS:
            raise HTTPException(status_code=422, detail="Estado de incidente inválido.")
        query = query.where(IncidenteEmergencia.estado == estado)
    if fuente:
        query = query.where(IncidenteEmergencia.fuente_origen == fuente)

    results = (await session.execute(query)).all()
    payloads = []
    for incident, zone_name, lat, lng in results:
        payloads.append(
            {
                "id": incident.id,
                "uuid_cliente": str(incident.uuid_cliente) if incident.uuid_cliente else None,
                "fuente_origen": incident.fuente_origen,
                "tipo_evento": incident.tipo_evento,
                "gravedad": incident.gravedad,
                "estado": incident.estado,
                "personas_afectadas": incident.personas_afectadas,
                "descripcion": incident.descripcion,
                "foto_url": incident.foto_url,
                "zona_riesgo_id": incident.zona_riesgo_id,
                "zona_riesgo_nombre": zone_name,
                "verificado": incident.verificado,
                "gps_accuracy_m": float(incident.gps_accuracy_m) if incident.gps_accuracy_m is not None else None,
                "capturado_en_dispositivo": (
                    incident.capturado_en_dispositivo.isoformat()
                    if incident.capturado_en_dispositivo is not None
                    else None
                ),
                "es_simulacion": incident.es_simulacion,
                "score_ia": float(incident.score_ia) if incident.score_ia is not None else None,
                "ubicacion": [float(lat), float(lng)],
                "creado_en": incident.creado_en.isoformat(),
            }
        )
    return payloads


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_incident(
    body: IncidentCreate,
    session: DbSession,
    user: Annotated[Usuario, Depends(get_current_user)],
    response: Response,
) -> dict:
    if body.gravedad not in GRAVEDADES:
        raise HTTPException(status_code=422, detail="Nivel de gravedad inválido.")

    point = func.ST_SetSRID(func.ST_MakePoint(body.lng, body.lat), 4326)
    zone_id = await session.scalar(
        select(ZonaRiesgo.id)
        .where(func.ST_Within(point, ZonaRiesgo.poligono_geom))
        .order_by(ZonaRiesgo.id)
        .limit(1)
    )
    incident_source = "REPORTE_CIUDADANO" if user.rol == "CIUDADANO" else "DATO_SIMULADO"
    statement = (
        insert(IncidenteEmergencia)
        .values(
            uuid_cliente=body.uuid_cliente,
            fuente_origen=incident_source,
            tipo_evento=body.tipo_evento,
            gravedad=body.gravedad,
            estado="PENDIENTE",
            personas_afectadas=body.personas_afectadas,
            descripcion=body.descripcion,
            foto_url=body.foto_url,
            zona_riesgo_id=zone_id,
            verificado=False,
            reportado_por=user.id,
            ubicacion_geom=WKTElement(f"POINT({body.lng} {body.lat})", srid=4326),
        )
        .on_conflict_do_nothing(index_elements=[IncidenteEmergencia.uuid_cliente])
        .returning(IncidenteEmergencia.id)
    )
    incident_id = await session.scalar(statement)
    if incident_id is None:
        existing = await session.scalar(
            select(IncidenteEmergencia).where(IncidenteEmergencia.uuid_cliente == body.uuid_cliente)
        )
        if existing is None:
            raise HTTPException(status_code=409, detail="El reporte está siendo sincronizado; vuelve a intentarlo.")
        if user.rol == "CIUDADANO" and existing.reportado_por not in (None, user.id):
            raise HTTPException(status_code=409, detail="El identificador del reporte ya fue utilizado.")
        response.status_code = status.HTTP_200_OK
        return {
            "id": existing.id,
            "uuid_cliente": str(body.uuid_cliente),
            "zona_riesgo_id": existing.zona_riesgo_id,
            "duplicado": True,
        }

    incident = await session.get(IncidenteEmergencia, incident_id)
    if incident is None:
        raise HTTPException(status_code=500, detail="No se pudo recuperar el incidente recién creado.")
    session.add(
        Auditoria(
            usuario_id=user.id,
            accion="INCIDENTE_CREADO",
            entidad="INCIDENTES",
            entidad_id=incident.id,
            detalle={"fuente_origen": incident.fuente_origen, "gravedad": incident.gravedad},
        )
    )
    await session.commit()
    await operations_hub.broadcast(
        "incidente_creado",
        {
            "id": incident.id,
            "tipo_evento": incident.tipo_evento,
            "gravedad": incident.gravedad,
            "fuente_origen": incident.fuente_origen,
            "personas_afectadas": incident.personas_afectadas,
            "lat": body.lat,
            "lng": body.lng,
            "zona_riesgo_id": zone_id,
        },
    )
    return {"id": incident.id, "uuid_cliente": str(body.uuid_cliente), "zona_riesgo_id": zone_id, "duplicado": False}


@router.patch("/{incident_id}/estado")
async def update_incident_state(
    incident_id: int,
    body: IncidentStateUpdate,
    session: DbSession,
    user: Annotated[Usuario, Depends(require_roles("OPERADOR_COE", "ADMIN"))],
) -> dict:
    if body.estado not in ESTADOS:
        raise HTTPException(status_code=422, detail="Estado de incidente inválido.")
    incident = await session.scalar(
        select(IncidenteEmergencia).where(IncidenteEmergencia.id == incident_id).with_for_update()
    )
    if incident is None:
        raise HTTPException(status_code=404, detail="Incidente no encontrado.")
    previous_state = incident.estado
    incident.estado = body.estado
    incident.actualizado_en = datetime.now(UTC)
    session.add(
        Auditoria(
            usuario_id=user.id,
            accion="INCIDENTE_ESTADO_CAMBIADO",
            entidad="INCIDENTES",
            entidad_id=incident.id,
            detalle={"anterior": previous_state, "nuevo": body.estado},
        )
    )
    await session.commit()
    await operations_hub.broadcast(
        "incidente_actualizado",
        {"id": incident.id, "estado_anterior": previous_state, "estado": incident.estado},
    )
    return {"id": incident.id, "estado": incident.estado}
