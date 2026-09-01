/**
 * ─────────────────────────────────────────────────────────
 *  queries/estadio.queries.ts  →  SQL puro para Estadio
 * ─────────────────────────────────────────────────────────
 *
 * Esta capa SOLO habla con la base de datos.
 * No sabe nada de HTTP, no conoce req ni res.
 * Solo recibe datos, ejecuta SQL y devuelve resultados.
 *
 * CONSEJO: Usa siempre parámetros ($1, $2...) en lugar de
 * concatenar strings. Esto previene SQL Injection.
 *
 * ❌ MAL:  `SELECT * FROM Club WHERE nombre = '${nombre}'`
 * ✅ BIEN: `SELECT * FROM Club WHERE nombre = $1`, [nombre]
 */

/*
La librería pg sirve para conectar tu aplicación de Node.js/Express con una base de datos PostgreSQL.
1. Conectarte a la base de datos
2. Ejecutar queries SQL
3. Insertar datos
4. Usarlo dentro de Express
*/

import { pool } from "../db/connection";
import { QueryResult } from "pg";
import { CreateEstadioDto } from "../schemas";

// ─── Tipos de retorno ─────────────────────────────────────

export interface Estadio {
  estadio_id: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
}

export interface EstadioConClubes extends Estadio {
  clubes: string[]; // Nombres de clubes que usan este estadio
}

// ─── Queries ──────────────────────────────────────────────

/**
 * Trae todos los estadios con sus clubes asociados.
 * Usamos LEFT JOIN para incluir estadios sin clubes.
 * STRING_AGG agrupa los nombres de clubes en un array separado por comas.
 */
export async function getAllEstadios(): Promise<Estadio[]> {
  const result: QueryResult<Estadio> = await pool.query(
    `SELECT 
       e.estadio_id,
       e.nombre,
       e.ubicacion,
       e.capacidad
     FROM Estadio e
     ORDER BY e.nombre ASC`,
  );
  return result.rows; //Estadio[]
}

/**
 * Trae un estadio por ID junto con la lista de clubes que lo usan.
 * COALESCE convierte NULL en array vacío cuando no hay clubes.
 */
export async function getEstadioById(
  id: number,
): Promise<EstadioConClubes | null> {
  const result: QueryResult<EstadioConClubes> = await pool.query(
    `SELECT 
       e.estadio_id,
       e.nombre,
       e.ubicacion,
       e.capacidad,
       COALESCE(
         ARRAY_AGG(c.nombre) FILTER (WHERE c.nombre IS NOT NULL),
         ARRAY[]::text[]
       ) AS clubes
     FROM Estadio e
     LEFT JOIN Club c ON c.estadio_id = e.estadio_id
     WHERE e.estadio_id = $1
     GROUP BY e.estadio_id`,
    [id],
  );

  // Si no hay filas, el estadio no existe
  return result.rows[0] ?? null;
}

/**
 * Inserta un nuevo estadio y devuelve el registro completo.
 * RETURNING * es una característica de Postgres que devuelve
 * la fila insertada (incluyendo el ID generado por serial).
 */
export async function createEstadio(data: CreateEstadioDto): Promise<Estadio> {
  const result: QueryResult<Estadio> = await pool.query(
    `INSERT INTO Estadio (nombre, ubicacion, capacidad)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.nombre, data.ubicacion, data.capacidad],
  );
  return result.rows[0];
}

/**
 * Elimina un estadio por ID.
 * Devuelve el número de filas afectadas (0 = no existía).
 *
 * IMPORTANTE: Si hay clubs o partidos que referencian este estadio,
 * Postgres lanzará un error de foreign key constraint.
 * Lo manejamos en el controller.
 */
export async function deleteEstadio(id: number): Promise<number> {
  const result = await pool.query(`DELETE FROM Estadio WHERE estadio_id = $1`, [
    id,
  ]);
  return result.rowCount ?? 0;
}

/**
 * Trae estadios con capacidad mayor a la indicada.
 * Útil para filtros desde query params: GET /estadios?minCapacidad=40000
 */
export async function getEstadiosByMinCapacity(
  minCapacity: number,
): Promise<Estadio[]> {
  const result: QueryResult<Estadio> = await pool.query(
    `SELECT * FROM Estadio
     WHERE capacidad >= $1
     ORDER BY capacidad DESC`,
    [minCapacity],
  );
  return result.rows;
}
