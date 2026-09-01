/**
 * controllers/estadio.controller.ts
 */

import { Request, Response } from "express";
import {
  getAllEstadios,
  getEstadioById,
  createEstadio,
  deleteEstadio,
  getEstadiosByMinCapacity,
} from "../queries/estadio.queries";
import { CreateEstadioDto } from "../schemas";
import { handleDbError } from "../middlewares/dbErrorHandler";

// ─── Handlers ─────────────────────────────────────────────

/**
 * GET /api/v1/estadios
 * GET /api/v1/estadios?minCapacidad=40000
 */

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { minCapacidad } = req.query;

    const estadios =
      minCapacidad && !isNaN(Number(minCapacidad))
        ? await getEstadiosByMinCapacity(Number(minCapacidad))
        : await getAllEstadios();

    res.status(200).json({
      status: "ok",
      count: estadios.length,
      data: estadios,
    });
  } catch (error) {
    handleDbError(error, res, "Estadio");
  }
}

/**
 * GET /api/v1/estadios/:id
 */
export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const estadio = await getEstadioById(id);

    if (!estadio) {
      res.status(404).json({
        status: "error",
        message: `Estadio con ID ${id} no encontrado`,
      });
      return;
    }

    res.status(200).json({ status: "ok", data: estadio });
  } catch (error) {
    handleDbError(error, res, "Estadio");
  }
}

/**
 * POST /api/v1/estadios
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as CreateEstadioDto;
    const nuevoEstadio = await createEstadio(body);

    res.status(201).json({
      status: "ok",
      message: "Estadio creado exitosamente",
      data: nuevoEstadio,
    });
  } catch (error) {
    handleDbError(error, res, "Estadio");
  }
}

/**
 * DELETE /api/v1/estadios/:id
 */
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const affected = await deleteEstadio(id);

    if (affected === 0) {
      res.status(404).json({
        status: "error",
        message: `Estadio con ID ${id} no encontrado`,
      });
      return;
    }

    res.status(200).json({
      status: "ok",
      message: `Estadio con ID ${id} eliminado exitosamente`,
    });
  } catch (error) {
    handleDbError(error, res, "Estadio");
  }
}
