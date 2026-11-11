import json
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, select

from app.models import (
    Auditoria,
    Hidrografia,
    InfraestructuraVial,
    ServicioEsencial,
    Usuario,
)
from app.realtime import operations_hub
from app.security import DbSession, require_roles

router = APIRouter(prefix="/api/capas", tags=["Capas cartográficas"])
roads_router = APIRouter(prefix="/api/vias", tags=["Infraestructura vial"])


class RoadStatusUpdate(BaseModel):
    estado_transito: str
    detalle_estado: str | None = Field(default=None, max_length=1000)


def feature_collection(rows: list[dict]) -> dict:
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": json.loads(row.pop("geometry")),
                "properties": row,
            }
            for row in rows
        ],
    }


@router.get("/vias")
async def roads(session: DbSession) -> dict:
    query = select(
        InfraestructuraVial.id,
        InfraestructuraVial.nombre_via,
        InfraestructuraVial.categoria,
        InfraestructuraVial.estado_transito,
        InfraestructuraVial.detalle_estado,
        func.ST_AsGeoJSON(InfraestructuraVial.linea_geom).label("geometry"),
    ).order_by(InfraestructuraVial.id)
    rows = [dict(row) for row in (await session.execute(query)).mappings()]
    return feature_collection(rows)


@router.get("/rios")
async def rivers(session: DbSession) -> dict:
    query = select(
        Hidrografia.id,
        Hidrografia.nombre,
        Hidrografia.tipo,
        func.ST_AsGeoJSON(Hidrografia.linea_geom).label("geometry"),
    ).order_by(Hidrografia.id)
    rows = [dict(row) for row in (await session.execute(query)).mappings()]
    return feature_collection(rows)


@router.get("/servicios")
async def essential_services(session: DbSession) -> dict:
    query = select(
        ServicioEsencial.id,
        ServicioEsencial.nombre,
        ServicioEsencial.tipo_servicio,
        ServicioEsencial.direccion,
        ServicioEsencial.telefono,
        func.ST_AsGeoJSON(ServicioEsencial.ubicacion_geom).label("geometry"),
    ).order_by(ServicioEsencial.id)
    rows = [dict(row) for row in (await session.execute(query)).mappings()]
    return feature_collection(rows)


@roads_router.get("")
async def list_roads(session: DbSession) -> dict:
    return await roads(session)


@roads_router.patch("/{road_id}/estado")
async def update_road_status(
    road_id: int,
    body: RoadStatusUpdate,
    session: DbSession,
    user: Annotated[Usuario, Depends(require_roles("OPERADOR_COE", "ADMIN"))],
) -> dict:
    if body.estado_transito not in {"OPERATIVA", "PRECAUCION", "INTERRUMPIDA"}:
        raise HTTPException(status_code=422, detail="Estado de tránsito inválido.")
    road = await session.scalar(
        select(InfraestructuraVial).where(InfraestructuraVial.id == road_id).with_for_update()
    )
    if road is None:
        raise HTTPException(status_code=404, detail="Vía no encontrada.")
    previous_state = road.estado_transito
    road.estado_transito = body.estado_transito
    if body.detalle_estado is not None:
        road.detalle_estado = body.detalle_estado
    session.add(
        Auditoria(
            usuario_id=user.id,
            accion="VIA_ESTADO_CAMBIADO",
            entidad="INFRAESTRUCTURA_VIAL",
            entidad_id=road.id,
            detalle={"anterior": previous_state, "nuevo": road.estado_transito},
        )
    )
    await session.commit()
    await operations_hub.broadcast(
        "via_actualizada",
        {"id": road.id, "estado_transito": road.estado_transito, "detalle_estado": road.detalle_estado},
    )
    return {"id": road.id, "estado_transito": road.estado_transito, "detalle_estado": road.detalle_estado}
