/**
 * routes/club.routes.ts
 */

import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateClubSchema, IdParamSchema } from "../schemas";
import * as clubController from "../controllers/club.controller";

/*
express() → aplicación completa
Router() → sub-aplicación (módulo de rutas)

El objeto router tiene métodos como:

router.get()
router.post()
router.delete()
router.use()

Y funciona igual que app, pero solo maneja rutas, no levanta servidor (listen no existe aquí)
*/
const router = Router();

// GET /api/v1/clubs
// GET /api/v1/clubs?ciudad=Santiago
router.get("/", clubController.getAll);

// GET /api/v1/clubs/:id
router.get("/:id", validate(IdParamSchema, "params"), clubController.getOne);

// POST /api/v1/clubs
router.post("/", validate(CreateClubSchema), clubController.create);

// DELETE /api/v1/clubs/:id
router.delete("/:id", validate(IdParamSchema, "params"), clubController.remove);

/*
 En app.js
 import estadioRoutes from "./routes/estadio.routes";

Eso significa que estadioRoutes ES el mismo objeto router
 */
export default router;
