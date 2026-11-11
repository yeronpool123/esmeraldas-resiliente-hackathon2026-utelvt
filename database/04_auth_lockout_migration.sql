-- Ejecutar una vez en bases creadas antes de habilitar el bloqueo de acceso.
CREATE TABLE IF NOT EXISTS login_attempts (
    subject_hash CHAR(64) PRIMARY KEY,
    failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
    locked_until TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
