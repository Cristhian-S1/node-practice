/**
 * ─────────────────────────────────────────────────────────
 *  app.ts  →  Configuración de Express
 * ─────────────────────────────────────────────────────────
 *
 * ¿Por qué separar app.ts de index.ts?
 * --------------------------------------
 * app.ts configura Express (middlewares, rutas, manejo de errores).
 * index.ts arranca el servidor (escucha en el puerto).
 *
 * Esta separación es útil para testing: en los tests importas
 * la app sin arrancar el servidor, y puedes hacer requests
 * con supertest sin conflictos de puerto.
 * 
    Flujo completo (app.ts)
  -  Crear instancia de Express (app)
  -  Registrar middlewares globales (express.json)
  -  Definir endpoint de health check (/health)
  -  Montar rutas de la API (/api/v1/...)
  -  Capturar rutas no encontradas (middleware 404)
  -  Manejar errores globales (error handler)
  -  Retornar la aplicación configurada (app)
 */

import express, { Application, Request, Response, NextFunction } from "express";
import estadioRoutes from "./routes/estadio.routes";
import clubRoutes from "./routes/club.routes";
import partidoRoutes from "./routes/partido.routes";

export function createApp(): Application {
  /*
  Crea y retorna una instancia de Application
  Esa instancia es tu servidor web completo
  Te permite definir rutas, middlewares y manejar requests
  */
  const app: Application = express();

  // ─── Middlewares globales ──────────────────────────────
  // express.json() parsea el body de los requests con Content-Type: application/json
  // Sin este middleware, req.body sería undefined
  app.use(express.json());

  //Necesario usar cors() para que el frontend pueda realizar peticiones
  app.use(cors());

  // ─── Health check ──────────────────────────────────────
  // Endpoint simple para verificar que el servidor está vivo.
  // Útil para Docker healthchecks, balanceadores de carga, etc.
  app.get("/health", (_req: Request, res: Response): void => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // ─── Rutas de la API ───────────────────────────────────
  // Prefijo /api/v1 en todas las rutas (versioning)
  app.use("/api/v1/estadios", estadioRoutes);
  app.use("/api/v1/clubs", clubRoutes);
  app.use("/api/v1/partidos", partidoRoutes);

  // ─── Ruta 404 ──────────────────────────────────────────
  // Captura cualquier ruta que no matcheó las anteriores.
  // Debe ir DESPUÉS de todas las rutas definidas.
  app.use((_req: Request, res: Response): void => {
    res.status(404).json({
      status: "error",
      message: "Ruta no encontrada",
    });
  });

  // ─── Manejo global de errores ──────────────────────────
  // Express reconoce un middleware con 4 parámetros como error handler.
  // Captura cualquier error que se lance con next(error) desde un controller.
  // Dentro de .use() se maneja una variable de tipo ErrorRequestHandler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error no manejado:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message || "Error interno del servidor",
    });
  });

  // Este middleware se puede trabajar de una mejor manera en /middlewares
  // donde reciba una clase que usa extends de Error para enviar next(ClaseExtendsError)
  // para de esa maneja enviar una clase con atributos status y messages.

  return app;
}
