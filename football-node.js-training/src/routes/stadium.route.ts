import { Router } from "express";
import * as stadiumController from "../controllers/stadium.controller";

const router: Router = Router();

//GET /api/v1/stadiums
router.get("/", stadiumController.getAll);

//Get /api/v1/stadiums/:id
router.get("/:id", stadiumController.getById);

export default router;
