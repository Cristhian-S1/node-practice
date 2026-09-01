/**
 * ─────────────────────────────────────────────────────────
 *  routes/estadio.routes.ts
 * ─────────────────────────────────────────────────────────
 *
 * Las rutas definen el "mapa" de la API: qué URL hace qué.
 * Cada ruta conecta: método HTTP + path → middlewares → controller
 *
 * Express Router permite agrupar rutas relacionadas y montarlas
 * bajo un prefijo común en app.ts (ej: /api/v1/estadios)
 *
 * CONSEJO sobre versioning: usar /api/v1/ desde el principio
 * es una buena práctica. Cuando hagas cambios breaking en el futuro,
 * creas /api/v2/ sin romper clientes que usan v1.
 */

import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateEstadioSchema, IdParamSchema } from "../schemas";
import * as estadioController from "../controllers/estadio.controller";

const router = Router();

// GET /api/v1/estadios
// GET /api/v1/estadios?minCapacidad=40000
router.get("/", estadioController.getAll);

// GET /api/v1/estadios/:id
// validate(schema, "params") valida los parámetros de ruta (:id)
router.get(
  "/:id",
  validate(IdParamSchema, "params"),
  estadioController.getOne
);

// POST /api/v1/estadios
// validate(schema) por defecto valida el body
router.post(
  "/",
  validate(CreateEstadioSchema),
  estadioController.create
);

// DELETE /api/v1/estadios/:id
router.delete(
  "/:id",
  validate(IdParamSchema, "params"),
  estadioController.remove
);

export default router;
