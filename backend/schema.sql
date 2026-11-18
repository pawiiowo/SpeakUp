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