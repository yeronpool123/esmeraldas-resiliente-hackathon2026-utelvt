-- Esquema operativo de Esmeraldas Resiliente.
-- Requiere una base de datos PostgreSQL con la extension PostGIS instalada.
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('CIUDADANO', 'OPERADOR_COE', 'ADMIN')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_sessions (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_jti UUID NOT NULL UNIQUE,
    expira_en TIMESTAMPTZ NOT NULL,
    revocado_en TIMESTAMPTZ,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_attempts (
    subject_hash CHAR(64) PRIMARY KEY,
    failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
    locked_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zonas_riesgo (
    id SERIAL PRIMARY KEY,
    nombre_sector VARCHAR(150) NOT NULL,
    parroquia VARCHAR(80),
    tipo_amenaza VARCHAR(60) NOT NULL CHECK (tipo_amenaza IN ('INUNDACION', 'DESLIZAMIENTO', 'DESBORDAMIENTO_RIO')),
    nivel_riesgo VARCHAR(30) NOT NULL CHECK (nivel_riesgo IN ('BAJO', 'MEDIO', 'ALTO', 'CRITICO')),
    descripcion TEXT,
    fuente_dato VARCHAR(120) NOT NULL DEFAULT 'DATO_SIMULADO',
    poligono_geom geometry(Polygon, 4326) NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hidrografia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('RIO', 'ESTERO')),
    linea_geom geometry(LineString, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS infraestructura_vial (
    id SERIAL PRIMARY KEY,
    nombre_via VARCHAR(150) NOT NULL,
    categoria VARCHAR(40) NOT NULL CHECK (categoria IN ('TRONCAL', 'PROVINCIAL', 'URBANA', 'PASARELA')),
    estado_transito VARCHAR(30) NOT NULL CHECK (estado_transito IN ('OPERATIVA', 'PRECAUCION', 'INTERRUMPIDA')),
    detalle_estado TEXT NOT NULL,
    linea_geom geometry(LineString, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS servicios_esenciales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo_servicio VARCHAR(40) NOT NULL CHECK (tipo_servicio IN ('SALUD', 'SEGURIDAD', 'BOMBEROS', 'ABASTECIMIENTO', 'EDUCACION')),
    direccion VARCHAR(200) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    ubicacion_geom geometry(Point, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS incidentes_emergencia (
    id SERIAL PRIMARY KEY,
    uuid_cliente UUID UNIQUE,
    fuente_origen VARCHAR(40) NOT NULL CHECK (fuente_origen IN ('REPORTE_CIUDADANO', 'DATO_SIMULADO', 'ALERTA_OFICIAL')),
    tipo_evento VARCHAR(80) NOT NULL,
    categoria_sos VARCHAR(40),
    gravedad VARCHAR(20) NOT NULL CHECK (gravedad IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'ATENDIDO', 'DESCARTADO')),
    personas_afectadas INTEGER NOT NULL DEFAULT 0 CHECK (personas_afectadas >= 0),
    descripcion TEXT NOT NULL,
    foto_url VARCHAR(500),
    zona_riesgo_id INTEGER REFERENCES zonas_riesgo(id),
    verificado BOOLEAN NOT NULL DEFAULT FALSE,
    score_ia NUMERIC(5, 2),
    reportado_por INTEGER REFERENCES usuarios(id),
    gps_accuracy_m NUMERIC(10, 2),
    capturado_en_dispositivo TIMESTAMPTZ,
    es_simulacion BOOLEAN NOT NULL DEFAULT FALSE,
    ubicacion_geom geometry(Point, 4326) NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE incidentes_emergencia
    ADD COLUMN IF NOT EXISTS categoria_sos VARCHAR(40),
    ADD COLUMN IF NOT EXISTS gps_accuracy_m NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS capturado_en_dispositivo TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS es_simulacion BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS albergues (
    id SERIAL PRIMARY KEY,
    nombre_albergue VARCHAR(150) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    responsable VARCHAR(120) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    capacidad_maxima INTEGER NOT NULL CHECK (capacidad_maxima > 0),
    ocupacion_actual INTEGER NOT NULL DEFAULT 0 CHECK (ocupacion_actual >= 0 AND ocupacion_actual <= capacidad_maxima),
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'CASI_LLENO', 'LLENO', 'CERRADO')),
    servicios TEXT[] NOT NULL DEFAULT '{}',
    ubicacion_geom geometry(Point, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS alertas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    mensaje TEXT NOT NULL,
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('INFORMATIVA', 'PRECAUCION', 'ALERTA', 'EMERGENCIA')),
    sector VARCHAR(120) NOT NULL,
    fuente VARCHAR(60) NOT NULL DEFAULT 'OPERADOR_COE',
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    emitida_por INTEGER REFERENCES usuarios(id),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS familias_afectadas (
    id SERIAL PRIMARY KEY,
    jefe_hogar VARCHAR(150) NOT NULL,
    telefono_contacto VARCHAR(30) NOT NULL,
    numero_integrantes INTEGER NOT NULL CHECK (numero_integrantes > 0),
    necesidades_prioritarias TEXT[] NOT NULL DEFAULT '{}',
    albergue_asignado_id INTEGER REFERENCES albergues(id),
    estado VARCHAR(30) NOT NULL DEFAULT 'REGISTRADA' CHECK (estado IN ('REGISTRADA', 'EVACUADA', 'ALBERGADA', 'ATENDIDA')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ubicacion_geom geometry(Point, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventario_suministros (
    id SERIAL PRIMARY KEY,
    tipo_item VARCHAR(40) NOT NULL UNIQUE CHECK (tipo_item IN ('KIT_ALIMENTOS', 'AGUA_POTABLE', 'KIT_MEDICINAS', 'KIT_ASEO')),
    descripcion VARCHAR(200) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_reservado INTEGER NOT NULL DEFAULT 0 CHECK (stock_reservado >= 0 AND stock_reservado <= stock)
);

CREATE TABLE IF NOT EXISTS entregas_asistencia (
    id SERIAL PRIMARY KEY,
    familia_id INTEGER NOT NULL REFERENCES familias_afectadas(id),
    inventario_id INTEGER NOT NULL REFERENCES inventario_suministros(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'ENTREGADA' CHECK (estado IN ('ENTREGADA', 'EN_TRANSITO', 'CANCELADA')),
    entregado_por INTEGER REFERENCES usuarios(id),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(60) NOT NULL,
    entidad VARCHAR(60) NOT NULL,
    entidad_id INTEGER,
    detalle JSONB NOT NULL DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zonas_riesgo_geom ON zonas_riesgo USING GIST (poligono_geom);
CREATE INDEX IF NOT EXISTS idx_hidrografia_geom ON hidrografia USING GIST (linea_geom);
CREATE INDEX IF NOT EXISTS idx_vias_geom ON infraestructura_vial USING GIST (linea_geom);
CREATE INDEX IF NOT EXISTS idx_servicios_geom ON servicios_esenciales USING GIST (ubicacion_geom);
CREATE INDEX IF NOT EXISTS idx_incidentes_geom ON incidentes_emergencia USING GIST (ubicacion_geom);
CREATE INDEX IF NOT EXISTS idx_albergues_geom ON albergues USING GIST (ubicacion_geom);
CREATE INDEX IF NOT EXISTS idx_familias_geom ON familias_afectadas USING GIST (ubicacion_geom);
CREATE INDEX IF NOT EXISTS idx_incidentes_estado_gravedad ON incidentes_emergencia (estado, gravedad);
CREATE INDEX IF NOT EXISTS idx_incidentes_creado ON incidentes_emergencia (creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_activa ON alertas (activa, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_usuario ON refresh_sessions (usuario_id, expira_en DESC);

CREATE OR REPLACE VIEW vw_albergues_ocupacion AS
SELECT
    id,
    nombre_albergue,
    capacidad_maxima,
    ocupacion_actual,
    capacidad_maxima - ocupacion_actual AS cupos_libres,
    ROUND(100.0 * ocupacion_actual / NULLIF(capacidad_maxima, 0), 1) AS porcentaje_ocupacion,
    CASE
        WHEN 100.0 * ocupacion_actual / NULLIF(capacidad_maxima, 0) >= 90 THEN 'CRITICO'
        WHEN 100.0 * ocupacion_actual / NULLIF(capacidad_maxima, 0) >= 70 THEN 'ALTO'
        ELSE 'NORMAL'
    END AS semaforo
FROM albergues;
