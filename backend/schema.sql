CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('profesor', 'alumno'))
);

CREATE TABLE IF NOT EXISTS clases (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(6) UNIQUE NOT NULL,
    materia VARCHAR(100) NOT NULL,
    profesor_id INT NOT NULL REFERENCES usuarios(id),
    activa BOOLEAN DEFAULT true,
    fila_pausada BOOLEAN NOT NULL DEFAULT false,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cambios para una base creada con la versión anterior de este archivo.
-- Se pueden correr varias veces sin error (son idempotentes).
ALTER TABLE clases ADD COLUMN IF NOT EXISTS fila_pausada BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE clases ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE clases ALTER COLUMN profesor_id SET NOT NULL;

CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    clase_id INT NOT NULL REFERENCES clases(id) ON DELETE CASCADE,
    alumno_id INT NOT NULL REFERENCES usuarios(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'en_espera'
        CHECK (estado IN ('en_espera', 'hablando', 'atendido', 'cancelado')),
    fecha_solicitud TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP
);

-- Regla: un alumno tiene como máximo un turno activo por clase.
CREATE UNIQUE INDEX IF NOT EXISTS turnos_un_activo_por_alumno
    ON turnos (clase_id, alumno_id)
    WHERE estado IN ('en_espera', 'hablando');

-- Regla: una clase tiene como máximo un turno 'hablando' a la vez.
CREATE UNIQUE INDEX IF NOT EXISTS turnos_un_hablando_por_clase
    ON turnos (clase_id)
    WHERE estado = 'hablando';
