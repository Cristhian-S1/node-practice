import express, { Application, NextFunction, Request, Response } from "express";
import stadiumRoutes from "./routes/stadium.route";
import teamRoutes from "./routes/team.route";
import matchRoutes from "./routes/match.route";

export function createApp(): Application {
  const app: Application = express(); //Retornar una instancia DIOS (servidor web completo)

  //app.use(cors()) para el frontend
  app.use(express.json()); //Middleware que permite entender req.body

  //endpoint para verificar si el servidor esta vivo
  app.get("/test", (_req: Request, res: Response): void => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      enviroment: process.env.NODE_ENV,
    });
  });

  // Rutas de la API con versionado
  app.use("/api/v1/stadiums", stadiumRoutes);
  app.use("/api/v1/teams", teamRoutes);
  app.use("/api/v1/matches", matchRoutes);

  // Prueba primero las rutas principales y sino cae en 404 not found
  app.use((_req: Request, res: Response): void => {
    res.status(404).json({
      status: "error",
      message: "Route not found",
    });
  });

  // Error que se dispara intencionalmente mediante next(error), de tipo ErrorRequestHandler
  app.use(
    (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
      console.log("Error for next(error)", err.message);
      res.status(500).json({
        status: "error",
        message: err.message || "Server error",
      });
    },
  );

  return app;
}
