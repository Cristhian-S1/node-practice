import { Application } from "express";
import { createApp } from "./app";
import { testConnection } from "./config/connections";
import dotenv from "dotenv";
import { Server } from "node:http";

dotenv.config(); // Carga el archivo .env y lo inyecta en process.env

const PORT = process.env.PORT ?? 3000;

async function startServer(): Promise<void> {
  try {
    await testConnection(); // Promise<void>

    const app: Application = createApp();

    const server: Server = app.listen(PORT, (): void => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.log(`Error starting the server ${err}`);
    process.exit(1);
  }
}

startServer(); // call the function to start the server
