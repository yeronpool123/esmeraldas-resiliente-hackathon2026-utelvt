from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select

from app.models import (
    Albergue,
    FamiliaAfectada,
    IncidenteEmergencia,
    InfraestructuraVial,
    Usuario,
)
from app.security import DbSession, require_roles

router = APIRouter(prefix="/api/kpis", tags=["Indicadores"])


@router.get("/resumen")
async def summary(
    session: DbSession,
    _operator: Annotated[Usuario, Depends(require_roles("OPERADOR_COE", "ADMIN"))],
) -> dict:
    incident_stats = (
        await session.execute(
            select(
                func.count(IncidenteEmergencia.id),
                func.coalesce(func.sum(IncidenteEmergencia.personas_afectadas), 0),
                func.count().filter(IncidenteEmergencia.estado == "PENDIENTE"),
            )
        )
    ).one()
    family_count = await session.scalar(select(func.count()).select_from(FamiliaAfectada))
    full_shelters = await session.scalar(
        select(func.count()).select_from(Albergue).where(
            100 * Albergue.ocupacion_actual >= 90 * Albergue.capacidad_maxima
        )
    )
    roads_blocked = await session.scalar(
        select(func.count()).select_from(InfraestructuraVial).where(
            InfraestructuraVial.estado_transito == "INTERRUMPIDA"
        )
    )
    return {
        "total_incidentes": incident_stats[0],
        "personas_afectadas": int(incident_stats[1]),
        "reportes_pendientes": incident_stats[2],
        "familias_afectadas": family_count,
        "albergues_criticos": full_shelters,
        "vias_interrumpidas": roads_blocked,
    }
