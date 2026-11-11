from collections import Counter
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from geoalchemy2.elements import WKTElement
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.models import (
    Albergue,
    Auditoria,
    EntregaAsistencia,
    FamiliaAfectada,
    InventarioItem,
    Usuario,
)
from app.realtime import operations_hub
from app.security import DbSession, require_roles

router = APIRouter(tags=["Asistencia humanitaria"])
OPERATOR = Depends(require_roles("ADMIN"))


class FamilyCreate(BaseModel):
    jefe_hogar: str = Field(min_length=2, max_length=150)
    telefono_contacto: str = Field(min_length=7, max_length=30)
    numero_integrantes: int = Field(ge=1, le=50)
    necesidades_prioritarias: list[str] = Field(max_length=20)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    albergue_asignado_id: int | None = Field(default=None, gt=0)


class DeliveryCreate(BaseModel):
    familia_id: int = Field(gt=0)
    inventario_id: int = Field(gt=0)
    cantidad: int = Field(ge=1, le=100000)


def mask_name(name: str) -> str:
    parts = name.split()
    return " ".join(f"{part[0]}{'*' * max(len(part) - 1, 2)}" for part in parts if part)


def mask_phone(phone: str) -> str:
    return f"{'*' * max(len(phone) - 4, 0)}{phone[-4:]}"


@router.get("/api/familias")
async def list_families(
    session: DbSession,
    _operator: Annotated[Usuario, OPERATOR],
) -> list[dict]:
    families = (await session.scalars(select(FamiliaAfectada).order_by(FamiliaAfectada.id))).all()
    return [
        {
            "id": family.id,
            "jefe_hogar": mask_name(family.jefe_hogar),
            "telefono_contacto": mask_phone(family.telefono_contacto),
            "numero_integrantes": family.numero_integrantes,
            "necesidades_prioritarias": family.necesidades_prioritarias,
            "albergue_asignado_id": family.albergue_asignado_id,
            "estado": family.estado,
        }
        for family in families
    ]


@router.post("/api/familias", status_code=201)
async def create_family(
    body: FamilyCreate,
    session: DbSession,
    user: Annotated[Usuario, OPERATOR],
) -> dict:
    shelter = None
    if body.albergue_asignado_id is not None:
        shelter = await session.scalar(
            select(Albergue)
            .where(Albergue.id == body.albergue_asignado_id)
            .with_for_update()
        )
        if shelter is None:
            raise HTTPException(status_code=404, detail="Albergue no encontrado.")
        if shelter.estado in {"LLENO", "CERRADO"} or shelter.ocupacion_actual >= shelter.capacidad_maxima:
            raise HTTPException(status_code=409, detail="El albergue no tiene cupo disponible.")

    needs = [need.strip().upper() for need in body.necesidades_prioritarias if need.strip()]
    if any(len(need) > 40 for need in needs):
        raise HTTPException(status_code=422, detail="Cada necesidad debe tener como máximo 40 caracteres.")
    family = FamiliaAfectada(
        jefe_hogar=body.jefe_hogar,
        telefono_contacto=body.telefono_contacto,
        numero_integrantes=body.numero_integrantes,
        necesidades_prioritarias=needs,
        albergue_asignado_id=shelter.id if shelter else None,
        estado="ALBERGADA" if shelter else "REGISTRADA",
        ubicacion_geom=WKTElement(f"POINT({body.lng} {body.lat})", srid=4326),
    )
    session.add(family)
    if shelter:
        shelter.ocupacion_actual += body.numero_integrantes
        if shelter.ocupacion_actual > shelter.capacidad_maxima:
            raise HTTPException(status_code=409, detail="La familia excede los cupos restantes del albergue.")
        if shelter.ocupacion_actual == shelter.capacidad_maxima:
            shelter.estado = "LLENO"
        elif shelter.ocupacion_actual / shelter.capacidad_maxima >= 0.9:
            shelter.estado = "CASI_LLENO"
        else:
            shelter.estado = "DISPONIBLE"
    await session.flush()
    session.add(
        Auditoria(
            usuario_id=user.id,
            accion="FAMILIA_REGISTRADA",
            entidad="FAMILIAS",
            entidad_id=family.id,
            detalle={
                "integrantes": family.numero_integrantes,
                "estado": family.estado,
                "albergue_id": family.albergue_asignado_id,
            },
        )
    )
    await session.commit()
    if shelter:
        await operations_hub.broadcast(
            "albergue_actualizado",
            {
                "id": shelter.id,
                "ocupacion_actual": shelter.ocupacion_actual,
                "capacidad_maxima": shelter.capacidad_maxima,
                "estado": shelter.estado,
            },
        )
    return {"id": family.id, "estado": family.estado}


@router.get("/api/necesidades-pendientes")
async def pending_needs(
    session: DbSession,
    _operator: Annotated[Usuario, OPERATOR],
) -> dict:
    families = (
        await session.scalars(
            select(FamiliaAfectada).where(FamiliaAfectada.estado.in_(("REGISTRADA", "EVACUADA")))
        )
    ).all()
    needs = Counter(
        need
        for family in families
        for need in family.necesidades_prioritarias
    )
    return {"necesidades": [{"tipo": need, "familias": count} for need, count in sorted(needs.items())]}


@router.get("/api/inventario")
async def list_inventory(
    session: DbSession,
    _operator: Annotated[Usuario, OPERATOR],
) -> list[dict]:
    items = (await session.scalars(select(InventarioItem).order_by(InventarioItem.id))).all()
    return [
        {
            "id": item.id,
            "tipo_item": item.tipo_item,
            "descripcion": item.descripcion,
            "stock": item.stock,
            "stock_reservado": item.stock_reservado,
        }
        for item in items
    ]


@router.post("/api/entregas", status_code=201)
async def create_delivery(
    body: DeliveryCreate,
    session: DbSession,
    user: Annotated[Usuario, OPERATOR],
) -> dict:
    family = await session.scalar(select(FamiliaAfectada).where(FamiliaAfectada.id == body.familia_id))
    if family is None:
        raise HTTPException(status_code=404, detail="Familia no encontrada.")
    item = await session.scalar(
        select(InventarioItem).where(InventarioItem.id == body.inventario_id).with_for_update()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Artículo de inventario no encontrado.")
    if item.stock - item.stock_reservado < body.cantidad:
        raise HTTPException(status_code=409, detail="Stock insuficiente; no se registró la entrega.")

    item.stock -= body.cantidad
    delivery = EntregaAsistencia(
        familia_id=family.id,
        inventario_id=item.id,
        cantidad=body.cantidad,
        estado="ENTREGADA",
        entregado_por=user.id,
    )
    session.add(delivery)
    await session.flush()
    session.add(
        Auditoria(
            usuario_id=user.id,
            accion="ENTREGA_REGISTRADA",
            entidad="ENTREGAS",
            entidad_id=delivery.id,
            detalle={"familia_id": family.id, "inventario_id": item.id, "cantidad": body.cantidad},
        )
    )
    await session.commit()
    await operations_hub.broadcast(
        "inventario_actualizado",
        {"id": item.id, "tipo_item": item.tipo_item, "stock": item.stock},
    )
    return {"id": delivery.id, "stock_restante": item.stock, "estado": delivery.estado}
