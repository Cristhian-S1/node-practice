/**
 * routes/club.routes.ts
 */

import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateClubSchema, IdParamSchema } from "../schemas";
import * as clubController from "../controllers/club.controller";

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

export default router;
