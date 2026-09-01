/**
 * ─────────────────────────────────────────────────────────
 *  queries/club.queries.ts  →  SQL puro para Club
 * ─────────────────────────────────────────────────────────
 */

import { pool } from "../db/connection";
import { CreateClubDto } from "../schemas";
import { QueryResult } from "pg";

// ─── Tipos ────────────────────────────────────────────────

export interface Club {
  club_id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  estadio_id: number | null;
}

// Vista enriquecida: Club + nombre del estadio
export interface ClubConEstadio extends Club {
  estadio_nombre: string | null;
  estadio_capacidad: number | null;
}

// ─── Queries ──────────────────────────────────────────────

/**
 * Todos los clubes con la info de su estadio.
 * LEFT JOIN porque un club puede no tener estadio asignado.
 */
export async function getAllClubes(): Promise<ClubConEstadio[]> {
  const result: QueryResult<ClubConEstadio> = await pool.query(
    `SELECT 
       c.club_id,
       c.nombre,
       c.direccion,
       c.ciudad,
       c.estadio_id,
       e.nombre     AS estadio_nombre,
       e.capacidad  AS estadio_capacidad
     FROM Club c
     LEFT JOIN Estadio e ON e.estadio_id = c.estadio_id
     ORDER BY c.nombre ASC`
  );
  return result.rows;
}

/**
 * Un club por ID, con info completa de su estadio.
 */
export async function getClubById(id: number): Promise<ClubConEstadio | null> {
  const result: QueryResult<ClubConEstadio> = await pool.query(
    `SELECT 
       c.club_id,
       c.nombre,
       c.direccion,
       c.ciudad,
       c.estadio_id,
       e.nombre     AS estadio_nombre,
       e.capacidad  AS estadio_capacidad
     FROM Club c
     LEFT JOIN Estadio e ON e.estadio_id = c.estadio_id
     WHERE c.club_id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

/**
 * Clubes de una ciudad específica.
 * ILIKE hace búsqueda case-insensitive (útil para búsquedas de usuario).
 * % es wildcard: 'Santiago' y 'santiago' ambos matchean.
 */
export async function getClubesByCiudad(ciudad: string): Promise<Club[]> {
  const result: QueryResult<Club> = await pool.query(
    `SELECT * FROM Club
     WHERE ciudad ILIKE $1
     ORDER BY nombre ASC`,
    [`%${ciudad}%`]
  );
  return result.rows;
}

/**
 * Insertar un club nuevo.
 * estadio_id es opcional, por eso usamos NULLIF para convertir
 * undefined en null antes de enviarlo a Postgres.
 */
export async function createClub(data: CreateClubDto): Promise<Club> {
  const result: QueryResult<Club> = await pool.query(
    `INSERT INTO Club (nombre, direccion, ciudad, estadio_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.nombre, data.direccion, data.ciudad, data.estadio_id ?? null]
  );
  return result.rows[0];
}

/**
 * Eliminar un club por ID.
 * Devolverá error si hay partidos que referencian este club.
 */
export async function deleteClub(id: number): Promise<number> {
  const result = await pool.query(
    `DELETE FROM Club WHERE club_id = $1`,
    [id]
  );
  return result.rowCount ?? 0;
}
