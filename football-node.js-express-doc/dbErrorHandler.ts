import { Response } from "express";

export const PG_ERROR = {
  UNIQUE_VIOLATION: "23505", // INSERT/UPDATE con valor duplicado en columna UNIQUE
  FOREIGN_KEY_VIOLATION: "23503", // FK apunta a un registro que no existe (o se intenta borrar uno referenciado)
  CHECK_VIOLATION: "23514", // Un CHECK constraint falló (ej: capacidad <= 0, goles negativos)
  NOT_NULL_VIOLATION: "23502", // Se envió NULL en una columna NOT NULL
  INVALID_TEXT_REPR: "22P02", // Tipo de dato inválido (ej: texto donde se espera integer)
} as const;

// ─── Tipo para el error que viene de pg ───────────────────
interface PostgresError {
  code?: string;
  constraint?: string; // Nombre del constraint que falló (útil para mensajes más específicos)
  detail?: string; // Detalle técnico del error (para logs)
}

const ERROR_RESPONSES: Record<
  string,
  (context?: string) => { status: number; message: string }
> = {
  [PG_ERROR.UNIQUE_VIOLATION]: (context) => ({
    status: 409,
    message: context
      ? `Ya existe un ${context} con ese nombre o identificador`
      : "Ya existe un registro con ese nombre o identificador",
  }),

  [PG_ERROR.FOREIGN_KEY_VIOLATION]: (context) => ({
    status: 409,
    message: context
      ? `No se puede completar la operación: ${context} referencia a un registro que no existe, o está siendo usado por otro registro`
      : "No se puede completar la operación: existe una dependencia entre registros",
  }),

  [PG_ERROR.CHECK_VIOLATION]: () => ({
    status: 400,
    message:
      "Los datos no cumplen las reglas de validación de la base de datos (ej: valores negativos o coherencia entre campos)",
  }),

  [PG_ERROR.NOT_NULL_VIOLATION]: () => ({
    status: 400,
    message: "Faltan campos obligatorios en los datos enviados",
  }),

  [PG_ERROR.INVALID_TEXT_REPR]: () => ({
    status: 400,
    message: "Uno o más valores tienen un formato de dato incorrecto",
  }),
};

// ─── Función principal ────────────────────────────────────

/**
 * Maneja un error de PostgreSQL y responde al cliente con
 * un mensaje HTTP legible.
 *
 * @param error    - El error capturado en el catch del controller
 * @param res      - El objeto Response de Express
 * @param context  - Nombre de la entidad (opcional) para mensajes más claros
 *
 * Ejemplo de uso en un controller:
 *
 *   } catch (error) {
 *     handleDbError(error, res, "Estadio");
 *   }
 */
export function handleDbError(
  error: unknown,
  res: Response,
  context?: string,
): void {
  const pgError = error as PostgresError;
  const code = pgError.code;

  // Log siempre en consola para debugging (el cliente no debe ver detalles internos)
  console.error(
    `[DB Error] code=${code} constraint=${pgError.constraint ?? "-"} detail=${pgError.detail ?? "-"}`,
  );

  // Buscar el código en el mapa de respuestas conocidas
  if (code && ERROR_RESPONSES[code]) {
    const { status, message } = ERROR_RESPONSES[code](context);
    res.status(status).json({ status: "error", message });
    return;
  }

  // Error desconocido: responder 500 sin exponer detalles internos
  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
}
