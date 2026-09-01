/**
 * ─────────────────────────────────────────────────────────
 *  index.ts  →  Punto de entrada del servidor
 * ─────────────────────────────────────────────────────────
 *
 * Este archivo tiene UNA sola responsabilidad:
 * arrancar el servidor HTTP y conectar la DB.
 *
 * El principio "fail fast" dice: si la DB no está disponible
 * al iniciar, es mejor fallar inmediatamente con un error claro
 * que arrancar y fallar silenciosamente en el primer request.
 * 
    Flujo completo
    - Cargar config (dotenv)
    - Validar dependencias críticas (DB)
    - Crear app (Express)
    - Arrancar servidor
    - Si algo falla → terminar proceso
 */

import { createApp } from "./app";
import { testConnection } from "./db/connection";
import dotenv from "dotenv"; // Librería para cargar variables de entorno desde un archivo .env.
import { Application } from "express";
import { Server } from "http";

// Carga el archivo .env y lo inyecta en process.env
dotenv.config();

const PORT = process.env.PORT ?? 3000;

async function bootstrap(): Promise<void> {
  try {
    // 1. Verificar conexión a la base de datos ANTES de arrancar
    // Si falla → lanza error → salta al catch
    await testConnection(); // Promise<void>

    /* 2. Crear la aplicación Express
    Se construye el servidor Express
    Se cargan: middlewares, rutas, handlers de error
    Importante, aún NO está escuchando requests */
    const app: Application = createApp();

    // 3. Arrancar el servidor
    // Abre un socket HTTP y empieza a escuchar requests
    // Server Es el servidor HTTP real que está escuchando conexiones TCP.
    // Express es solo una capa encima, pero quien realmente escucha es Node.
    const server: Server = app.listen(PORT, (): void => {
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
    // Si la DB no está disponible, mostramos error y salimos
    // process.exit(1) indica que el proceso terminó con error
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

bootstrap();
