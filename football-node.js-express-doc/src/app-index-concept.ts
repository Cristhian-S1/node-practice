/**
 * =====================================================================
 * app.ts – Configuración de la aplicación Express
 * =====================================================================
 *
 * Este archivo tiene la responsabilidad ÚNICA de configurar la aplicación
 * Express: middlewares globales, rutas, manejo de 404 y error handler global.
 *
 * Se exporta una función `createApp` que devuelve la instancia configurada.
 * Esto permite:
 *   - Testing: importar la app sin levantar el servidor (supertest).
 *   - Separación de concerns: la configuración de rutas y middlewares
 *     está aislada del código que inicia el servidor (index.ts).
 *
 * =====================================================================
 */

import express, { Application, Request, Response, NextFunction } from "express";
import estadioRoutes from "./routes/estadio.routes";
import clubRoutes from "./routes/club.routes";
import partidoRoutes from "./routes/partido.routes";

/**
 * createApp - Fábrica que construye y configura una instancia de Express.
 * @returns {Application} Aplicación Express lista para usarse (con listen o en tests).
 */
export function createApp(): Application {
  /*
  Crea y retorna una instancia de Application
  Esa instancia es tu servidor web completo
  Te permite definir rutas, middlewares y manejar requests
  */
  const app = express();

  // -------------------------------------------------------------------
  // Middlewares globales
  // -------------------------------------------------------------------

  /**
   * express.json() es un middleware incorporado que analiza el cuerpo
   * de las peticiones con Content-Type: application/json.
   * Sin él, req.body sería undefined en los controladores.
   * Colocarlo al principio asegura que todas las rutas puedan acceder al body parseado.
   */
  app.use(express.json());

  // -------------------------------------------------------------------
  // Health check
  // -------------------------------------------------------------------

  /**
   * GET /health
   * Endpoint público para verificar que el servidor está vivo.
   * Útil para health checks de Docker/Kubernetes, balanceadores de carga, etc.
   * Devuelve:
   *   - status: "ok"
   *   - timestamp: momento de la respuesta (ISO)
   *   - environment: NODE_ENV actual (útil para depuración)
   */
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // -------------------------------------------------------------------
  // Rutas de la API (versionadas)
  // -------------------------------------------------------------------

  /**
   * Se montan los routers con el prefijo /api/v1.
   * Esto permite versionar la API. Si en el futuro se necesita una versión
   * incompatible, se puede crear /api/v2 sin afectar a los clientes antiguos.
   *
   * Cada router (estadioRoutes, clubRoutes, partidoRoutes) contiene las rutas
   * específicas para ese recurso (GET, POST, DELETE, etc.) y sus controladores.
   */
  app.use("/api/v1/estadios", estadioRoutes);
  app.use("/api/v1/clubs", clubRoutes);
  app.use("/api/v1/partidos", partidoRoutes);

  // -------------------------------------------------------------------
  // Middleware para rutas no encontradas (404)
  // -------------------------------------------------------------------

  /**
   * Este middleware se ejecuta si ninguna de las rutas anteriores coincide.
   * Debe ir DESPUÉS de todas las rutas definidas, porque Express ejecuta
   * los middlewares en el orden en que se registran.
   *
   * Devuelve un JSON con formato uniforme en lugar de la página HTML por defecto.
   */
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      status: "error",
      message: "Ruta no encontrada",
    });
  });

  // -------------------------------------------------------------------
  // Manejador global de errores
  // -------------------------------------------------------------------

  /**
   * Express identifica un middleware como manejador de errores si tiene
   * CUATRO parámetros: (err, req, res, next).
   * Este middleware captura cualquier error que se pase a next(err) desde
   * controladores o middlewares anteriores.
   *
   * Es el último recurso: devuelve un error 500 genérico sin exponer detalles
   * internos (seguridad). En desarrollo se podría enriquecer la respuesta,
   * pero aquí se mantiene simple.
   *
   * La directiva eslint disables el warning de variable no usada (_next),
   * indicando que es intencional.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error no manejado:", err.message);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  });

  return app;
}

/**
 * =====================================================================
 * index.ts – Punto de entrada del servidor
 * =====================================================================
 *
 * Este archivo tiene UNA sola responsabilidad: arrancar el servidor HTTP
 * después de verificar que las dependencias externas (base de datos) están listas.
 *
 * Principio "fail fast": si la base de datos no está disponible al iniciar,
 * es mejor fallar inmediatamente con un error claro que arrancar y fallar
 * silenciosamente en el primer request.
 *
 * =====================================================================
 */

import { createApp } from "./app";
import { testConnection } from "./db/connection";
import dotenv from "dotenv";

// Carga las variables de entorno desde el archivo .env a process.env
dotenv.config();

// Define el puerto: usa process.env.PORT o 3000 por defecto.
// El operador ?? (nullish coalescing) solo reemplaza undefined o null,
// a diferencia de || que también reemplaza valores falsy como '' o 0.
const PORT = process.env.PORT ?? 3000;

/**
 * bootstrap - Función asíncrona que orquesta el inicio de la aplicación.
 * @returns {Promise<void>}
 */
async function bootstrap(): Promise<void> {
  try {
    // -----------------------------------------------------------------
    // 1. Verificar conexión a la base de datos ANTES de arrancar
    // -----------------------------------------------------------------
    /**
     * testConnection debe ser una función que lance un error si no puede
     * conectar a la base de datos. Por ejemplo, con Sequelize sería:
     *   await sequelize.authenticate();
     * Con TypeORM sería:
     *   await dataSource.initialize();
     *
     * Si falla, el catch capturará el error y detendremos el proceso.
     * Esto sigue el principio "fail fast": no arrancamos si la DB no responde.
     */
    await testConnection();

    // -----------------------------------------------------------------
    // 2. Crear la aplicación Express (configuración de app.ts)
    // -----------------------------------------------------------------
    const app = createApp();

    // -----------------------------------------------------------------
    // 3. Arrancar el servidor HTTP
    // -----------------------------------------------------------------
    /**
     * app.listen() inicia el servidor en el puerto especificado.
     * El callback se ejecuta cuando el servidor está realmente escuchando.
     * Allí imprimimos información útil para el desarrollador.
     */
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📋 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`\n📌 Endpoints disponibles:`);
      console.log(`   GET    /health`);
      console.log(`   GET    /api/v1/estadios`);
      console.log(`   GET    /api/v1/estadios/:id`);
      console.log(`   POST   /api/v1/estadios`);
      console.log(`   DELETE /api/v1/estadios/:id`);
      console.log(`   GET    /api/v1/clubs`);
      console.log(`   GET    /api/v1/clubs/:id`);
      console.log(`   POST   /api/v1/clubs`);
      console.log(`   DELETE /api/v1/clubs/:id`);
      console.log(`   GET    /api/v1/partidos`);
      console.log(`   GET    /api/v1/partidos/club/:clubId`);
      console.log(`   POST   /api/v1/partidos`);
      console.log(`   DELETE /api/v1/partidos`);
    });
  } catch (error) {
    /**
     * Si ocurre cualquier error (fallo en DB, puerto ocupado, etc.),
     * lo mostramos y terminamos el proceso con código 1 (error).
     * En producción, se podría registrar el error en un servicio externo
     * y dejar que el orquestador (Kubernetes, PM2) reinicie el proceso.
     */
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// ¡Arrancamos!
bootstrap();
