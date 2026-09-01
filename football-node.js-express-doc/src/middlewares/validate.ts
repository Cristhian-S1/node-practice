/**
 * ─────────────────────────────────────────────────────────
 *  middlewares/validate.ts  →  Middleware de validación
 * ─────────────────────────────────────────────────────────
 *
 * ¿Qué es un middleware en Express?
 * ----------------------------------
 * Es una función que se ejecuta ENTRE que llega el request
 * y antes que responda el controlador. Tiene acceso a req, res
 * y a next (función para pasar al siguiente middleware o controlador).
 *
 * Flujo:
 *   Request → [validate(schema)] → [Controller] → Response
 *
 * Si la validación falla, responde directamente con 400 y no
 * llama a next(), por lo que el controller nunca se ejecuta.
 *
 * TRUCO: Al hacerlo genérico con ZodSchema, este mismo middleware
 * sirve para TODOS los endpoints. No necesitas repetir lógica.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError, SafeParseReturnType, z } from "zod";

type Source = "body" | "params" | "query";

/**
 * Fábrica de middlewares de validación.
 *
 * @param schema  - El schema Zod con el que validar
 * @param source  - De dónde sacar los datos: body, params o query
 *
 * Ejemplo de uso en routes:
 *   router.post("/", validate(CreateEstadioSchema), estadioController.create)
 *   router.get("/:id", validate(IdParamSchema, "params"), estadioController.getOne)
 */

// Retorna un middleware de Express
export function validate(
  schema: ZodSchema,
  source: Source = "body",
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    // schema.safeParse NO lanza excepción: devuelve { success, data } o { success, error }
    // Preferimos "safeParse" sobre "parse" para manejar el error nosotros mismos
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // ZodError tiene un método .flatten() que organiza los errores por campo
      // fieldErrors: { nombre: ["muy corto"], capacidad: ["debe ser positivo"] }
      const { fieldErrors } = (result.error as ZodError).flatten();

      res.status(400).json({
        status: "error",
        message: "Datos inválidos",
        errors: fieldErrors,
      });
      return; // Importante: salir sin llamar next()
    }

    // Si la validación pasó, reemplazamos los datos crudos con los datos
    // parseados y transformados por Zod (ej: "5" → 5 en IdParamSchema)
    req[source] = result.data;
    next();
  };
}
