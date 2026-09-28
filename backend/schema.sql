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
    profesor_id INT REFERENCES usuarios(id),
    activa BOOLEAN DEFAULT true
);