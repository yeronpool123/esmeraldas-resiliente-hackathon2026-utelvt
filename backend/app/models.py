import uuid
from datetime import datetime
from decimal import Decimal

from geoalchemy2 import Geometry
from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(20), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("TRUE"))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class RefreshSession(Base):
    __tablename__ = "refresh_sessions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    token_jti: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, nullable=False)
    expira_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revocado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    subject_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    failed_attempts: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class ZonaRiesgo(Base):
    __tablename__ = "zonas_riesgo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre_sector: Mapped[str] = mapped_column(String(150), nullable=False)
    parroquia: Mapped[str | None] = mapped_column(String(80))
    tipo_amenaza: Mapped[str] = mapped_column(String(60), nullable=False)
    nivel_riesgo: Mapped[str] = mapped_column(String(30), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    fuente_dato: Mapped[str] = mapped_column(String(120), nullable=False)
    poligono_geom = mapped_column(Geometry("POLYGON", srid=4326), nullable=False)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class IncidenteEmergencia(Base):
    __tablename__ = "incidentes_emergencia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid_cliente: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), unique=True)
    fuente_origen: Mapped[str] = mapped_column(String(40), nullable=False)
    tipo_evento: Mapped[str] = mapped_column(String(80), nullable=False)
    categoria_sos: Mapped[str | None] = mapped_column(String(40))
    gravedad: Mapped[str] = mapped_column(String(20), nullable=False)
    estado: Mapped[str] = mapped_column(String(30), nullable=False, server_default=text("'PENDIENTE'"))
    personas_afectadas: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    foto_url: Mapped[str | None] = mapped_column(String(500))
    zona_riesgo_id: Mapped[int | None] = mapped_column(ForeignKey("zonas_riesgo.id"))
    verificado: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("FALSE"))
    score_ia: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    reportado_por: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))
    gps_accuracy_m: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    capturado_en_dispositivo: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    es_simulacion: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("FALSE"))
    ubicacion_geom = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class Albergue(Base):
    __tablename__ = "albergues"
    __table_args__ = (
        CheckConstraint("ocupacion_actual <= capacidad_maxima", name="ck_albergues_ocupacion_capacidad"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre_albergue: Mapped[str] = mapped_column(String(150), nullable=False)
    direccion: Mapped[str] = mapped_column(String(200), nullable=False)
    responsable: Mapped[str] = mapped_column(String(120), nullable=False)
    telefono: Mapped[str] = mapped_column(String(30), nullable=False)
    capacidad_maxima: Mapped[int] = mapped_column(Integer, nullable=False)
    ocupacion_actual: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    estado: Mapped[str] = mapped_column(String(20), nullable=False, server_default=text("'DISPONIBLE'"))
    servicios: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, server_default=text("'{}'"))
    ubicacion_geom = mapped_column(Geometry("POINT", srid=4326), nullable=False)


class Auditoria(Base):
    __tablename__ = "auditoria"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))
    accion: Mapped[str] = mapped_column(String(60), nullable=False)
    entidad: Mapped[str] = mapped_column(String(60), nullable=False)
    entidad_id: Mapped[int | None] = mapped_column(Integer)
    detalle: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class InfraestructuraVial(Base):
    __tablename__ = "infraestructura_vial"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre_via: Mapped[str] = mapped_column(String(150), nullable=False)
    categoria: Mapped[str] = mapped_column(String(40), nullable=False)
    estado_transito: Mapped[str] = mapped_column(String(30), nullable=False)
    detalle_estado: Mapped[str] = mapped_column(Text, nullable=False)
    linea_geom = mapped_column(Geometry("LINESTRING", srid=4326), nullable=False)


class FamiliaAfectada(Base):
    __tablename__ = "familias_afectadas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    jefe_hogar: Mapped[str] = mapped_column(String(150), nullable=False)
    telefono_contacto: Mapped[str] = mapped_column(String(30), nullable=False)
    numero_integrantes: Mapped[int] = mapped_column(Integer, nullable=False)
    necesidades_prioritarias: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False)
    albergue_asignado_id: Mapped[int | None] = mapped_column(ForeignKey("albergues.id"))
    estado: Mapped[str] = mapped_column(String(30), nullable=False)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    ubicacion_geom = mapped_column(Geometry("POINT", srid=4326), nullable=False)


class Alerta(Base):
    __tablename__ = "alertas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    titulo: Mapped[str] = mapped_column(String(180), nullable=False)
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    nivel: Mapped[str] = mapped_column(String(20), nullable=False)
    sector: Mapped[str] = mapped_column(String(120), nullable=False)
    fuente: Mapped[str] = mapped_column(String(60), nullable=False)
    activa: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("TRUE"))
    emitida_por: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class InventarioItem(Base):
    __tablename__ = "inventario_suministros"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tipo_item: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    descripcion: Mapped[str] = mapped_column(String(200), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False)
    stock_reservado: Mapped[int] = mapped_column(Integer, nullable=False)


class EntregaAsistencia(Base):
    __tablename__ = "entregas_asistencia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    familia_id: Mapped[int] = mapped_column(ForeignKey("familias_afectadas.id"), nullable=False)
    inventario_id: Mapped[int] = mapped_column(ForeignKey("inventario_suministros.id"), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    estado: Mapped[str] = mapped_column(String(20), nullable=False)
    entregado_por: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class Hidrografia(Base):
    __tablename__ = "hidrografia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    tipo: Mapped[str] = mapped_column(String(30), nullable=False)
    linea_geom = mapped_column(Geometry("LINESTRING", srid=4326), nullable=False)


class ServicioEsencial(Base):
    __tablename__ = "servicios_esenciales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    tipo_servicio: Mapped[str] = mapped_column(String(40), nullable=False)
    direccion: Mapped[str] = mapped_column(String(200), nullable=False)
    telefono: Mapped[str] = mapped_column(String(30), nullable=False)
    ubicacion_geom = mapped_column(Geometry("POINT", srid=4326), nullable=False)
