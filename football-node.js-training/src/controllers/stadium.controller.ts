import { Request, Response } from "express";
import { getStadiumById, Stadium } from "../models/stadium.model";
import { getAllStadiums } from "../models/stadium.model";

//GET /api/v1/stadiums - get all stadiums
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const stadiums: Stadium[] = await getAllStadiums();

    res.status(200).json({
      status: "ok",
      count: stadiums.length,
      data: stadiums,
    });
  } catch (error) {
    console.log(`Error fetching all stadiums`);
    res.status(500).json({
      status: "error",
      message: "Error fetching all stadiums",
    });
  }
}

//GET /api/v1/stadiums/:id - get one stadium by id
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id: number = Number(req.params.id);
    const stadium: Stadium | null = await getStadiumById(id);

    if (!stadium) {
      res.status(404).json({
        status: "error",
        message: `Stadiums with ID ${id} not found`,
      });
      return;
    }

    res.status(200).json({
      status: "ok",
      data: stadium,
    });
  } catch (err) {
    console.error(`Error fetching stadium: ${err}`);
  }
}
