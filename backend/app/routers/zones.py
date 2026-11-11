import json
from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.models import ZonaRiesgo
from app.security import DbSession

router = APIRouter(prefix="/api/zonas-riesgo", tags=["Zonas de riesgo"])


@router.get("")
async def list_zones(
    session: DbSession,
    nivel: Annotated[str | None, Query(pattern="^(BAJO|MEDIO|ALTO|CRITICO)$")] = None,
) -> dict:
    query = select(
        ZonaRiesgo.id,
        ZonaRiesgo.nombre_sector,
        ZonaRiesgo.parroquia,
        ZonaRiesgo.tipo_amenaza,
        ZonaRiesgo.nivel_riesgo,
        ZonaRiesgo.descripcion,
        ZonaRiesgo.fuente_dato,
        func.ST_AsGeoJSON(ZonaRiesgo.poligono_geom).label("geometry"),
    ).order_by(ZonaRiesgo.id)
    if nivel:
        query = query.where(ZonaRiesgo.nivel_riesgo == nivel)
    rows = (await session.execute(query)).mappings().all()
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": json.loads(row["geometry"]),
                "properties": {
                    "id": row["id"],
                    "nombre_sector": row["nombre_sector"],
                    "parroquia": row["parroquia"],
                    "tipo_amenaza": row["tipo_amenaza"],
                    "nivel_riesgo": row["nivel_riesgo"],
                    "descripcion": row["descripcion"],
                    "fuente_dato": row["fuente_dato"],
                },
            }
            for row in rows
        ],
    }


@router.get("/contener")
async def find_containing_zone(
    session: DbSession,
    lat: Annotated[float, Query(ge=-90, le=90)],
    lng: Annotated[float, Query(ge=-180, le=180)],
) -> dict | None:
    point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
    query = (
        select(ZonaRiesgo)
        .where(func.ST_Within(point, ZonaRiesgo.poligono_geom))
        .order_by(ZonaRiesgo.id)
        .limit(1)
    )
    zone = await session.scalar(query)
    if zone is None:
        return None
    return {
        "id": zone.id,
        "nombre_sector": zone.nombre_sector,
        "parroquia": zone.parroquia,
        "tipo_amenaza": zone.tipo_amenaza,
        "nivel_riesgo": zone.nivel_riesgo,
        "fuente_dato": zone.fuente_dato,
    }
