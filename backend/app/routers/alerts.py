from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.models import Alerta, Auditoria, Usuario
from app.realtime import operations_hub
from app.security import DbSession, require_roles

router = APIRouter(prefix="/api/alertas", tags=["Alertas"])
LEVELS = {"INFORMATIVA", "PRECAUCION", "ALERTA", "EMERGENCIA"}


class AlertCreate(BaseModel):
    titulo: str = Field(min_length=3, max_length=180)
    mensaje: str = Field(min_length=1, max_length=2000)
    nivel: str
    sector: str = Field(min_length=2, max_length=120)


@router.get("")
async def list_alerts(session: DbSession, activa: bool = True) -> list[dict]:
    alerts = (
        await session.scalars(
            select(Alerta).where(Alerta.activa == activa).order_by(Alerta.creado_en.desc())
        )
    ).all()
    return [
        {
            "id": alert.id,
            "titulo": alert.titulo,
            "mensaje": alert.mensaje,
            "nivel": alert.nivel,
            "sector": alert.sector,
            "fuente": alert.fuente,
            "activa": alert.activa,
            "creado_en": alert.creado_en.isoformat(),
        }
        for alert in alerts
    ]


@router.post("", status_code=201)
async def create_alert(
    body: AlertCreate,
    session: DbSession,
    user: Annotated[Usuario, Depends(require_roles("OPERADOR_COE", "ADMIN"))],
) -> dict:
    if body.nivel not in LEVELS:
        raise HTTPException(status_code=422, detail="Nivel de alerta inválido.")
    alert = Alerta(
        titulo=body.titulo,
        mensaje=body.mensaje,
        nivel=body.nivel,
        sector=body.sector,
        fuente="OPERADOR_COE",
        activa=True,
        emitida_por=user.id,
    )
    session.add(alert)
    await session.flush()
    session.add(
        Auditoria(
            usuario_id=user.id,
            accion="ALERTA_EMITIDA",
            entidad="ALERTAS",
            entidad_id=alert.id,
            detalle={"nivel": alert.nivel, "sector": alert.sector},
        )
    )
    await session.commit()
    await operations_hub.broadcast(
        "alerta_emitida",
        {"id": alert.id, "titulo": alert.titulo, "nivel": alert.nivel, "sector": alert.sector},
    )
    return {"id": alert.id, "titulo": alert.titulo, "nivel": alert.nivel, "sector": alert.sector}


@router.patch("/{alert_id}")
async def deactivate_alert(
    alert_id: int,
    session: DbSession,
    user: Annotated[Usuario, Depends(require_roles("OPERADOR_COE", "ADMIN"))],
) -> dict:
    alert = await session.scalar(select(Alerta).where(Alerta.id == alert_id).with_for_update())
    if alert is None:
        raise HTTPException(status_code=404, detail="Alerta no encontrada.")
    alert.activa = False
    session.add(
        Auditoria(
            usuario_id=user.id,
            accion="ALERTA_DESACTIVADA",
            entidad="ALERTAS",
            entidad_id=alert.id,
            detalle={"fecha": datetime.now(UTC).isoformat()},
        )
    )
    await session.commit()
    await operations_hub.broadcast("alerta_desactivada", {"id": alert.id})
    return {"id": alert.id, "activa": alert.activa}
