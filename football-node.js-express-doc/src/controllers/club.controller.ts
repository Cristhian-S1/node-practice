/**
 * controllers/club.controller.ts
 */

import { Request, Response } from "express";
import {
  getAllClubes,
  getClubById,
  getClubesByCiudad,
  createClub,
  deleteClub,
} from "../queries/club.queries";
import { CreateClubDto } from "../schemas";
import { handleDbError } from "../middlewares/dbErrorHandler";

// ─── Handlers ─────────────────────────────────────────────

/**
 * GET /clubs
 * GET /clubs?ciudad=Santiago  → filtra por ciudad
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { ciudad } = req.query;

    let clubes;
    if (ciudad && typeof ciudad === "string") {
      clubes = await getClubesByCiudad(ciudad);
    } else {
      clubes = await getAllClubes();
    }

    res.status(200).json({
      status: "ok",
      count: clubes.length,
      data: clubes,
    });
  } catch (error) {
    handleDbError(error, res, "Club");
  }
}

/**
 * GET /api/v1/clubs/:id
 */
export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const club = await getClubById(id);

    if (!club) {
      res.status(404).json({
        status: "error",
        message: `Club con ID ${id} no encontrado`,
      });
      return;
    }

    res.status(200).json({ status: "ok", data: club });
  } catch (error) {
    handleDbError(error, res, "Club");
  }
}

/**
 * POST /api/v1/clubs
 * Body: { nombre, direccion, ciudad, estadio_id? }
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as CreateClubDto;
    const nuevoClub = await createClub(body);

    res.status(201).json({
      status: "ok",
      message: "Club creado exitosamente",
      data: nuevoClub,
    });
  } catch (error) {
    handleDbError(error, res, "Club");
  }
}

/**
 * DELETE /api/v1/clubs/:id
 */
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const affected = await deleteClub(id);

    if (affected === 0) {
      res.status(404).json({
        status: "error",
        message: `Club con ID ${id} no encontrado`,
      });
      return;
    }

    res.status(200).json({
      status: "ok",
      message: `Club con ID ${id} eliminado exitosamente`,
    });
  } catch (error) {
    handleDbError(error, res, "Club");
  }
}
