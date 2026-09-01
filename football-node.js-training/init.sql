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
create table if not exists Stadium (
    stadium_id serial primary key,
    name varchar(32) not null,
    ubication varchar(56) not null,
    capacity integer not null,

    constraint capacity_stadium_positive check(capacity > 0),
    constraint name_stadium_unique unique (name)
);

create table if not exists Team (
    team_id serial primary key,
    name varchar(16) not null,
    direction varchar(56) not null,
    city varchar(56) not null,
    stadium_id integer,

    constraint team_name_unique unique (name),
    constraint fk_stadium_team foreign key (stadium_id) references Stadium(stadium_id)
);

create table if not exists Match (
    date_time date  not null,
    schedule time not null,
    goals_home integer not null,
    goals_away integer not null,

    stadium_id integer not null,
    team_id_away integer not null,
    team_id_local integer not null,

    constraint match_pk_primary primary key ( team_id_away, team_id_local, date_time),
    constraint fk_stadium_match foreign key (stadium_id) references Stadium(stadium_id),
    constraint fk_club_match_away foreign key (team_id_away) references Team(team_id),
    constraint fk_club_match_home foreign key (team_id_local) references Team(team_id),

    constraint goals_home_positive check (goals_home >= 0),
    constraint goals_away_positive check (goals_away >= 0),
    constraint match_consistent check (team_id_local != team_id_away)
);

-- Datos de prueba
INSERT INTO Stadium (name, ubication, capacity) VALUES
    ('Estadio Nacional', 'Santiago, Chile', 48000),
    ('Monumental',       'Santiago, Chile', 47000)
ON CONFLICT (name) DO NOTHING;

INSERT INTO Team (name, direction, city, stadium_id) VALUES
    ('UChile',    'Av Grecia 2001',      'Santiago', 1),
    ('ColoColo',  'Av Marathon 5300',    'Santiago', 2),
    ('UCatolica', 'Av Las Flores 13000', 'Santiago', 1),
    ('OHiggins',  'Av Cachapoal 100',    'Rancagua', 2)
ON CONFLICT (name) DO NOTHING;

INSERT INTO Match (date_time, schedule, goals_home, goals_away, stadium_id, team_id_away, team_id_local)
VALUES
    ('2025-03-10', '18:00', 2, 1, 1, 2, 1),
    ('2025-03-12', '20:30', 0, 0, 2, 4, 3)
ON CONFLICT DO NOTHING;
