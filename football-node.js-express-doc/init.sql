-- ─────────────────────────────────────────────────────────
--  init.sql  →  Script de inicialización de la base de datos
-- ─────────────────────────────────────────────────────────
--
-- Este archivo se ejecuta automáticamente cuando el contenedor
-- de PostgreSQL se crea por primera vez (imagen oficial de Postgres).
-- Si el volumen ya existe (la DB ya fue inicializada), este script
-- NO se vuelve a ejecutar.
--
-- Úsalo para: crear tablas, insertar datos de prueba, crear índices, etc.

-- Tablas
CREATE TABLE IF NOT EXISTS Estadio (
    estadio_id SERIAL PRIMARY KEY,
    nombre     VARCHAR(32)  NOT NULL,
    ubicacion  VARCHAR(56)  NOT NULL,
    capacidad  INTEGER      NOT NULL,

    CONSTRAINT capacidad_estadio_positivo CHECK (capacidad > 0),
    CONSTRAINT nombre_estadio_unico UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS Club (
    club_id    SERIAL PRIMARY KEY,
    nombre     VARCHAR(16)  NOT NULL,
    direccion  VARCHAR(56)  NOT NULL,
    ciudad     VARCHAR(56)  NOT NULL,
    estadio_id INTEGER,

    CONSTRAINT club_nombre_unico UNIQUE (nombre),
    CONSTRAINT fk_estadio_club FOREIGN KEY (estadio_id) REFERENCES Estadio(estadio_id)
);

CREATE TABLE IF NOT EXISTS Partido (
    fecha          DATE    NOT NULL,
    horario        TIME    NOT NULL,
    goles_local    INTEGER NOT NULL,
    goles_visita   INTEGER NOT NULL,
    estadio_id     INTEGER NOT NULL,
    club_id_visita INTEGER NOT NULL,
    club_id_local  INTEGER NOT NULL,

    CONSTRAINT partido_pk_primary PRIMARY KEY (club_id_visita, club_id_local, fecha),
    CONSTRAINT fk_estadio_partido  FOREIGN KEY (estadio_id)     REFERENCES Estadio(estadio_id),
    CONSTRAINT fk_club_visita      FOREIGN KEY (club_id_visita) REFERENCES Club(club_id),
    CONSTRAINT fk_club_local       FOREIGN KEY (club_id_local)  REFERENCES Club(club_id),

    CONSTRAINT goles_local_positivo  CHECK (goles_local  >= 0),
    CONSTRAINT goles_visita_positivo CHECK (goles_visita >= 0),
    CONSTRAINT partido_coherente     CHECK (club_id_local != club_id_visita)
);

-- Datos de prueba
INSERT INTO Estadio (nombre, ubicacion, capacidad) VALUES
    ('Estadio Nacional', 'Santiago, Chile', 48000),
    ('Monumental',       'Santiago, Chile', 47000)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO Club (nombre, direccion, ciudad, estadio_id) VALUES
    ('UChile',    'Av Grecia 2001',      'Santiago', 1),
    ('ColoColo',  'Av Marathon 5300',    'Santiago', 2),
    ('UCatolica', 'Av Las Flores 13000', 'Santiago', 1),
    ('OHiggins',  'Av Cachapoal 100',    'Rancagua', 2)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO Partido (fecha, horario, goles_local, goles_visita, estadio_id, club_id_visita, club_id_local)
VALUES
    ('2025-03-10', '18:00', 2, 1, 1, 2, 1),
    ('2025-03-12', '20:30', 0, 0, 2, 4, 3)
ON CONFLICT DO NOTHING;
