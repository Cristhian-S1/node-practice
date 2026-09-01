/**
 * controllers/partido.controller.ts
 */

import { Request, Response } from "express";
import {
  getAllPartidos,
  getPartidosByClub,
  getPartidosByFecha,
  createPartido,
  deletePartido,
} from "../queries/partido.queries";
import { CreatePartidoDto, DeletePartidoDto } from "../schemas";
import { handleDbError } from "../middlewares/dbErrorHandler";

// ─── Handlers ─────────────────────────────────────────────

/**
 * GET /api/v1/partidos
 * GET /api/v1/partidos?desde=2025-01-01&hasta=2025-12-31
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const { desde, hasta } = req.query;

    const partidos =
      desde && hasta && typeof desde === "string" && typeof hasta === "string"
        ? await getPartidosByFecha(desde, hasta)
        : await getAllPartidos();

    res.status(200).json({
      status: "ok",
      count: partidos.length,
      data: partidos,
    });
  } catch (error) {
    handleDbError(error, res, "Partido");
  }
}

/**
 * GET /api/v1/partidos/club/:clubId
 * Todos los partidos (local o visita) de un club
 */
export async function getByClub(req: Request, res: Response): Promise<void> {
  try {
    const clubId = Number(req.params.clubId);

    if (isNaN(clubId) || clubId <= 0) {
      res.status(400).json({
        status: "error",
        message: "El ID del club debe ser un número entero positivo",
      });
      return;
    }

    const partidos = await getPartidosByClub(clubId);

    res.status(200).json({
      status: "ok",
      count: partidos.length,
      data: partidos,
    });
  } catch (error) {
    handleDbError(error, res, "Partido");
  }
}

/**
 * POST /api/v1/partidos
 * Body: { fecha, horario, goles_local, goles_visita, estadio_id, club_id_local, club_id_visita }
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as CreatePartidoDto;
    const nuevoPartido = await createPartido(body);

    res.status(201).json({
      status: "ok",
      message: "Partido creado exitosamente",
      data: nuevoPartido,
    });
  } catch (error) {
    handleDbError(error, res, "Partido");
  }
}

/**
 * DELETE /api/v1/partidos
 * Body: { club_id_local, club_id_visita, fecha }
 */
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as DeletePartidoDto;
    const affected = await deletePartido(body);

    if (affected === 0) {
      res.status(404).json({
        status: "error",
        message: "Partido no encontrado con esos datos",
      });
      return;
    }

    res.status(200).json({
      status: "ok",
      message: "Partido eliminado exitosamente",
    });
  } catch (error) {
    handleDbError(error, res, "Partido");
  }
}
