/**
 * ─────────────────────────────────────────────────────────
 *  queries/partido.queries.ts  →  SQL puro para Partido
 * ─────────────────────────────────────────────────────────
 *
 * Nota sobre la clave primaria compuesta de Partido:
 * La PK es (club_id_visita, club_id_local, fecha).
 * Eso significa que dos clubes pueden jugar varias veces,
 * pero no en la misma fecha. El DELETE requiere los tres campos.
 */

import { pool } from "../db/connection";
import { CreatePartidoDto, DeletePartidoDto } from "../schemas";
import { QueryResult } from "pg";

// ─── Tipos ────────────────────────────────────────────────

export interface Partido {
  fecha: string;
  horario: string;
  goles_local: number;
  goles_visita: number;
  estadio_id: number;
  club_id_local: number;
  club_id_visita: number;
}

// Vista enriquecida para mostrar al cliente
export interface PartidoDetalle {
  fecha: string;
  horario: string;
  goles_local: number;
  goles_visita: number;
  club_local: string;
  club_visita: string;
  estadio: string;
  resultado: string; // "2 - 1" generado en SQL
}

// ─── Queries ──────────────────────────────────────────────

/**
 * Todos los partidos con nombres de clubes y estadio.
 * CONCAT genera el resultado legible directamente en SQL.
 * Ordenados por fecha descendente (más recientes primero).
 */
export async function getAllPartidos(): Promise<PartidoDetalle[]> {
  const result: QueryResult<PartidoDetalle> = await pool.query(
    `SELECT
       p.fecha,
       p.horario,
       p.goles_local,
       p.goles_visita,
       cl.nombre  AS club_local,
       cv.nombre  AS club_visita,
       e.nombre   AS estadio,
       CONCAT(p.goles_local, ' - ', p.goles_visita) AS resultado
     FROM Partido p
     JOIN Club cl  ON cl.club_id  = p.club_id_local
     JOIN Club cv  ON cv.club_id  = p.club_id_visita
     JOIN Estadio e ON e.estadio_id = p.estadio_id
     ORDER BY p.fecha DESC`
  );
  return result.rows;
}

/**
 * Partidos de un club específico (ya sea local o visita).
 * El OR en el WHERE captura ambos casos.
 * TRUCO: Usar el mismo $1 dos veces es válido en Postgres.
 */
export async function getPartidosByClub(clubId: number): Promise<PartidoDetalle[]> {
  const result: QueryResult<PartidoDetalle> = await pool.query(
    `SELECT
       p.fecha,
       p.horario,
       p.goles_local,
       p.goles_visita,
       cl.nombre  AS club_local,
       cv.nombre  AS club_visita,
       e.nombre   AS estadio,
       CONCAT(p.goles_local, ' - ', p.goles_visita) AS resultado
     FROM Partido p
     JOIN Club cl  ON cl.club_id  = p.club_id_local
     JOIN Club cv  ON cv.club_id  = p.club_id_visita
     JOIN Estadio e ON e.estadio_id = p.estadio_id
     WHERE p.club_id_local = $1 OR p.club_id_visita = $1
     ORDER BY p.fecha DESC`,
    [clubId]
  );
  return result.rows;
}

/**
 * Partidos en un rango de fechas.
 * Recibe dos strings 'YYYY-MM-DD' y Postgres los castea a DATE.
 * BETWEEN es inclusivo en ambos extremos.
 */
export async function getPartidosByFecha(
  desde: string,
  hasta: string
): Promise<PartidoDetalle[]> {
  const result: QueryResult<PartidoDetalle> = await pool.query(
    `SELECT
       p.fecha,
       p.horario,
       p.goles_local,
       p.goles_visita,
       cl.nombre  AS club_local,
       cv.nombre  AS club_visita,
       e.nombre   AS estadio,
       CONCAT(p.goles_local, ' - ', p.goles_visita) AS resultado
     FROM Partido p
     JOIN Club cl  ON cl.club_id  = p.club_id_local
     JOIN Club cv  ON cv.club_id  = p.club_id_visita
     JOIN Estadio e ON e.estadio_id = p.estadio_id
     WHERE p.fecha BETWEEN $1 AND $2
     ORDER BY p.fecha DESC`,
    [desde, hasta]
  );
  return result.rows;
}

/**
 * Insertar un nuevo partido.
 * Usamos una transacción explícita para garantizar que si algo
 * falla a mitad de camino, no queden datos parciales.
 * Para una sola INSERT no es estrictamente necesario, pero es
 * buena práctica mostrarlo cuando hay validaciones extra.
 */
export async function createPartido(data: CreatePartidoDto): Promise<Partido> {
  const result: QueryResult<Partido> = await pool.query(
    `INSERT INTO Partido
       (fecha, horario, goles_local, goles_visita, estadio_id, club_id_local, club_id_visita)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.fecha,
      data.horario,
      data.goles_local,
      data.goles_visita,
      data.estadio_id,
      data.club_id_local,
      data.club_id_visita,
    ]
  );
  return result.rows[0];
}

/**
 * Eliminar un partido por su clave primaria compuesta.
 * Los tres campos deben coincidir exactamente.
 */
export async function deletePartido(data: DeletePartidoDto): Promise<number> {
  const result = await pool.query(
    `DELETE FROM Partido
     WHERE club_id_local = $1
       AND club_id_visita = $2
       AND fecha = $3`,
    [data.club_id_local, data.club_id_visita, data.fecha]
  );
  return result.rowCount ?? 0;
}
