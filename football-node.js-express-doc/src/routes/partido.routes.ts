/**
 * routes/partido.routes.ts
 */

import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreatePartidoSchema, DeletePartidoSchema } from "../schemas";
import * as partidoController from "../controllers/partido.controller";

const router = Router();

// GET /api/v1/partidos
// GET /api/v1/partidos?desde=2025-01-01&hasta=2025-12-31
router.get("/", partidoController.getAll);

// GET /api/v1/partidos/club/:clubId
// IMPORTANTE: Esta ruta va ANTES de /:id para evitar conflictos.
// Si pusieramos /:id primero, "club" sería capturado como un :id.
router.get("/club/:clubId", partidoController.getByClub);

// POST /api/v1/partidos
router.post("/", validate(CreatePartidoSchema), partidoController.create);

// DELETE /api/v1/partidos
// Usa body con los 3 campos de la clave compuesta
router.delete("/", validate(DeletePartidoSchema), partidoController.remove);

export default router;
