import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool: Pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  max: 5, //Maximo 5 conexiones simulateneas
  idleTimeoutMillis: 30000, //ms aque puede estar una conexion inactiva antes de cerrarse
  connectionTimeoutMillis: 2000, //ms para establecer una conexion antes de lanzar error
});

export async function testConnection(): Promise<void> {
  const client: PoolClient = await pool.connect(); //Con await obtenemos el PoolClient
  try {
    await client.query("select now()");
    console.log(
      "Connection to the PostgreSQL database established successfully",
    );
  } finally {
    client.release();
  }
}
