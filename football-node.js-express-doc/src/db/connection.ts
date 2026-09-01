/**
 * ─────────────────────────────────────────────────────────
 *  db/connection.ts  →  Conexión a PostgreSQL con Pool
 * ─────────────────────────────────────────────────────────
 *
 * ¿Por qué un Pool y no una conexión directa?
 * -------------------------------------------
 * Un Pool mantiene un grupo de conexiones abiertas y las reutiliza.
 * Crear una conexión a Postgres cuesta tiempo (~50ms). Con un pool,
 * la conexión ya está lista y solo "la pedís prestada" por la duración
 * de la query. Esto es fundamental en un servidor web con múltiples
 * requests concurrentes.
 *
 * Analogía: es como una pileta de herramientas en una fábrica.
 * En vez de ir a comprar un martillo cada vez que lo necesitás,
 * lo sacás del armario compartido y lo devolvés al terminar.
 * 
  Beneficios principales:
 
  Pooling automático: Maneja eficientemente las conexiones
  Prevención de SQL injection: Usa parámetros preparados ($1, $2, etc.)
  Transacciones: Soporte completo para BEGIN/COMMIT/ROLLBACK
  Escalabilidad: Maneja múltiples conexiones concurrentes
  Tipado: Buena integración con TypeScript para seguridad de tipos
*/

/*
La librería pg sirve para conectar tu aplicación de Node.js/Express con una base de datos PostgreSQL.
1. Conectarte a la base de datos
2. Ejecutar queries SQL
3. Insertar datos
4. Usarlo dentro de Express
*/
import { Pool } from "pg";
import dotenv from "dotenv";

// dotenv.config() lee el archivo .env y carga las variables
// en process.env. Debe llamarse lo antes posible.
dotenv.config();

// Creamos el pool con las variables de entorno.
// CONSEJO: Nunca pongas credenciales hardcodeadas en el código.
/*
class Pool {
  constructor(config: PoolConfig) {
    Asigna cada propiedad del objeto config a this
    this.host = config.host ?? 'localhost'; // valor por defecto
    this.port = config.port ?? 5432;
    this.user = config.user;
    this.password = config.password;
    this.database = config.database;
    this.max = config.max ?? 10;
  }
}
*/
export const pool: Pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Máximo de conexiones simultáneas en el pool
  // Para desarrollo 5 está bien; en producción se ajusta según la carga
  max: 5,

  // Tiempo máximo (ms) que una conexión puede estar inactiva antes de cerrarse
  idleTimeoutMillis: 30000,

  // Tiempo máximo (ms) para establecer una conexión antes de lanzar error
  connectionTimeoutMillis: 2000,
});

/**
 * Función de prueba de conexión.
 * La llamamos al iniciar el servidor para fallar temprano
 * si la DB no está disponible (principio "fail fast").
 */
export async function testConnection(): Promise<void> {
  // 1. pool.connect() retorna Promise<PoolClient>
  // 2. Con await obtenemos el PoolClient
  const client = await pool.connect();
  try {
    await client.query("SELECT NOW()");
    console.log("Conexión a PostgreSQL exitosa");
  } finally {
    // IMPORTANTE: siempre devolver el cliente al pool aunque haya error (liberar cliente)
    client.release();
  }
}

/*
pool.connect() retorna una Promesa que, cuando se resuelve, te da un cliente del pool. Vamos a verlo en detalle:

¿Qué retorna exactamente pool.connect()?
typescript
// Esto retorna una Promise<PoolClient>
const clientPromise = pool.connect();

// Cuando haces await, obtienes un PoolClient
const client = await pool.connect();
La estructura completa
typescript
import { Pool, PoolClient } from "pg";

export async function testConnection(): Promise<void> {
  // 1. pool.connect() retorna Promise<PoolClient>
  // 2. Con await obtenemos el PoolClient
  const client: PoolClient = await pool.connect();
  
  try {
    // 3. El cliente tiene métodos como query()
    const result = await client.query("SELECT NOW()");
    console.log("Conexión a PostgreSQL exitosa", result.rows[0]);
  } finally {
    // 4. IMPORTANTE: liberar el cliente
    client.release();
  }
}
¿Qué es exactamente un PoolClient?
El PoolClient es un objeto que representa una conexión activa a la base de datos. Tiene métodos como:

typescript
interface PoolClient {
  // Ejecutar queries
  query(sql: string, values?: any[]): Promise<QueryResult>;
  
  // Transacciones
  query(query: { text: string, values?: any[] }): Promise<QueryResult>;
  
  // Liberar el cliente de vuelta al pool
  release(): void;
  
  // Liberar y destruir la conexión (no devolverla al pool)
  release(err?: Error): void;
  
  // Eventos
  on(event: string, listener: Function): this;
  
  // Propiedades
  processID?: number;
  secretKey?: number;
}
Visualización del flujo

 POOL (5 conexiones max)
 ┌─────────────────────────────────────┐
 │  [CONN1] [CONN2] [CONN3] [CONN4] [CONN5] │
 └─────────────────────────────────────┘
          │
          │ pool.connect()
          ▼
 ┌─────────────────────────────────────┐
 │  Cliente obtenido (ej: CONN3)       │
 │  Úsalo para queries                  │
 └─────────────────────────────────────┘
          │
          │ client.release()
          ▼
 ┌─────────────────────────────────────┐
 │  CONN3 vuelve al pool               │
 │  Listo para ser reutilizado         │
 └─────────────────────────────────────┘
Versión sin async/await (para entender mejor)
typescript
export function testConnection(): Promise<void> {
  // pool.connect() retorna una promesa
  return pool.connect()
    .then(client => {
      // Aquí tenemos el cliente
      return client.query("SELECT NOW()")
        .then(result => {
          console.log("✅ Conexión exitosa");
          client.release(); // Liberar en éxito
        })
        .catch(error => {
          client.release(); // Liberar en error también
          throw error;
        });
    });
}
¿Por qué es importante client.release()?
typescript
// MAL: ¡Nunca liberar el cliente!
async function badExample() {
  const client = await pool.connect();
  await client.query("SELECT * FROM users");
  // ❌ El cliente queda "colgado", no vuelve al pool
  // Después de 5 llamadas así, el pool se agota
}

// BIEN: Siempre liberar
async function goodExample() {
  const client = await pool.connect();
  try {
    await client.query("SELECT * FROM users");
  } finally {
    client.release(); // ✅ Siempre se ejecuta, incluso con errores
  }
}

// También funciona: liberar en ambos casos
async function anotherGoodExample() {
  const client = await pool.connect();
  await client.query("SELECT * FROM users").catch(err => {
    client.release();
    throw err;
  });
  client.release();
}
El objeto que retorna query()
Para completar, cuando haces client.query(), retorna:

typescript
interface QueryResult {
  rows: any[];           // Las filas resultado
  rowCount: number;      // Número de filas afectadas/retornadas
  command: string;       // Comando SQL ejecutado
  fields: FieldInfo[];   // Información de las columnas
  oid?: number;          // Solo para INSERTs
}

// Ejemplo de uso
const result = await client.query("SELECT NOW() as time");
console.log(result.rows);      // [{ time: 2024-01-01T... }]
console.log(result.rowCount);  // 1
console.log(result.fields);    // [{ name: 'time', dataTypeID: 1184 }]
En resumen
pool.connect() → Promesa que resuelve a un PoolClient

PoolClient → Representa una conexión activa del pool

client.query() → Ejecuta queries y retorna QueryResult

client.release() → OBLIGATORIO: devuelve la conexión al pool

El patrón try-finally que usas es exactamente la forma correcta de manejar esto, ¡garantizando que siempre liberes el cliente incluso si hay errores!

 */
