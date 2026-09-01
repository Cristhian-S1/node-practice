import { pool } from "../config/connections";
import { QueryResult } from "pg";

export interface Stadium {
  stadium_id: number;
  name: string;
  ubication: string;
  capacidad: number;
}

export async function getAllStadiums(): Promise<Stadium[]> {
  const result: QueryResult<Stadium> = await pool.query(
    `select * from stadium`,
  );
  return result.rows; //Return Stadium[]
}

export async function getStadiumById(id: number): Promise<Stadium | null> {
  const result: QueryResult<Stadium> = await pool.query(
    `select * from stadium where stadium_id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
}
