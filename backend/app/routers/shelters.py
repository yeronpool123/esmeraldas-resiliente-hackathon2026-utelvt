from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from geoalchemy2 import Geography
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import cast, func, select

from app.models import Albergue, Auditoria, InfraestructuraVial, Usuario
from app.realtime import operations_hub
from app.security import DbSession, require_roles

router = APIRouter(prefix="/api/albergues", tags=["Albergues"])


class OccupancyChange(BaseModel):
    delta: int = Field(ge=-10000, le=10000)

    @field_validator("delta")
    @classmethod
    def require_nonzero_change(cls, value: int) -> int:
        if value == 0:
            raise ValueError("El cambio de ocupación no puede ser cero.")
        return value


def occupancy_status(occupied: int, capacity: int) -> str:
    if occupied >= capacity:
        return "LLENO"
    if occupied / capacity >= 0.9:
        return "CASI_LLENO"
    return "DISPONIBLE"


@router.get("")
async def list_shelters(session: DbSession) -> list[dict]:
    rows = (
        await session.execute(
            select(
                Albergue,
                func.ST_Y(Albergue.ubicacion_geom).label("lat"),
                func.ST_X(Albergue.ubicacion_geom).label("lng"),
            ).order_by(Albergue.id)
        )
    ).all()
    return [
        {
            "id": shelter.id,
            "nombre_albergue": shelter.nombre_albergue,
            "direccion": shelter.direccion,
            "responsable": shelter.responsable,
            "telefono": shelter.telefono,
            "capacidad_maxima": shelter.capacidad_maxima,
            "ocupacion_actual": shelter.ocupacion_actual,
            "estado": shelter.estado,
            "servicios": shelter.servicios,
            "ubicacion": [float(lat), float(lng)],
        }
        for shelter, lat, lng in rows
    ]


@router.get("/cercanos")
async def nearby_shelters(
    session: DbSession,
    lat: Annotated[float, Query(ge=-90, le=90)],
    lng: Annotated[float, Query(ge=-180, le=180)],
    limit: Annotated[int, Query(ge=1, le=20)] = 3,
) -> dict:
    origin = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
    origin_geography = cast(origin, Geography(srid=4326))
    distance = func.ST_Distance(cast(Albergue.ubicacion_geom, Geography(srid=4326)), origin_geography)
    blocked_route = (
        select(1)
        .select_from(InfraestructuraVial)
        .where(
            InfraestructuraVial.estado_transito == "INTERRUMPIDA",
            func.ST_Intersects(
                cast(func.ST_MakeLine(Albergue.ubicacion_geom, origin), Geography(srid=4326)),
                func.ST_Buffer(
                    cast(InfraestructuraVial.linea_geom, Geography(srid=4326)),
                    150,
                ),
            ),
        )
        .exists()
    )
    query = (
        select(
            Albergue,
            func.ST_Y(Albergue.ubicacion_geom).label("lat"),
            func.ST_X(Albergue.ubicacion_geom).label("lng"),
            distance.label("distancia_m"),
            blocked_route.label("ruta_bloqueada"),
        )
        .where(
            Albergue.estado.not_in(("LLENO", "CERRADO")),
            Albergue.ocupacion_actual < Albergue.capacidad_maxima,
        )
        .order_by(distance)
        .limit(limit)
    )
    rows = (await session.execute(query)).all()
    return {
        "origen": {"lat": lat, "lng": lng},
        "resultados": [
            {
                "id": shelter.id,
                "nombre_albergue": shelter.nombre_albergue,
                "distancia_m": round(float(distance_m)),
                "cupos": shelter.capacidad_maxima - shelter.ocupacion_actual,
                "porcentaje_ocupacion": round(100 * shelter.ocupacion_actual / shelter.capacidad_maxima, 1),
                "ruta_bloqueada": bool(route_blocked),
                "ubicacion": [float(shelter_lat), float(shelter_lng)],
            }
            for shelter, shelter_lat, shelter_lng, distance_m, route_blocked in rows
        ],
    }


@router.patch("/{shelter_id}/ocupacion")
async def change_occupancy(
    shelter_id: int,
    body: OccupancyChange,
    session: DbSession,
    user: Annotated[Usuario, Depends(require_roles("OPERADOR_COE", "ADMIN"))],
) -> dict:
    shelter = await session.scalar(
        select(Albergue).where(Albergue.id == shelter_id).with_for_update()
    )
    if shelter is None:
        raise HTTPException(status_code=404, detail="Albergue no encontrado.")
    new_occupancy = shelter.ocupacion_actual + body.delta
    if not 0 <= new_occupancy <= shelter.capacidad_maxima:
        raise HTTPException(status_code=409, detail="El cambio excede la capacidad o la ocupación actual.")

    previous = shelter.ocupacion_actual
    shelter.ocupacion_actual = new_occupancy
    shelter.estado = occupancy_status(new_occupancy, shelter.capacidad_maxima)
    session.add(
        Auditoria(
            usuario_id=user.id,
            accion="ALBERGUE_OCUPACION",
            entidad="ALBERGUES",
            entidad_id=shelter.id,
            detalle={"anterior": previous, "nuevo": new_occupancy, "delta": body.delta},
        )
    )
    await session.commit()
    await operations_hub.broadcast(
        "albergue_actualizado",
        {
            "id": shelter.id,
            "ocupacion_actual": shelter.ocupacion_actual,
            "capacidad_maxima": shelter.capacidad_maxima,
            "estado": shelter.estado,
        },
    )
    return {
        "id": shelter.id,
        "ocupacion_actual": shelter.ocupacion_actual,
        "capacidad_maxima": shelter.capacidad_maxima,
        "cupos_libres": shelter.capacidad_maxima - shelter.ocupacion_actual,
        "porcentaje_ocupacion": round(100 * shelter.ocupacion_actual / shelter.capacidad_maxima, 1),
        "estado": shelter.estado,
    }
