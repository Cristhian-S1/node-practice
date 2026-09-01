/**
 * ─────────────────────────────────────────────────────────
 *  schemas/index.ts  →  Validación de datos con Zod
 * ─────────────────────────────────────────────────────────
 *
 * ¿Qué es Zod y por qué lo usamos?
 * ----------------------------------
 * Zod es una librería de validación y parsing que funciona
 * perfecto con TypeScript. Define la "forma" que deben tener
 * tus datos y valida en runtime (cuando el servidor ya está corriendo).
 *
 * El flujo es:
 *   Request del cliente → Middleware valida con Zod → Controller → Query
 *
 * Si los datos no pasan la validación, el error se maneja ANTES
 * de tocar la base de datos. Esto evita SQL injection accidental,
 * errores de tipo y datos corruptos.
 *
 * TRUCO: z.infer<typeof MiSchema> genera el tipo TypeScript
 * automáticamente desde el schema. No necesitas definir la
 * interface por separado.
 */

import { z } from "zod";

// ─── ESTADIO ──────────────────────────────────────────────

/*
¿Qué hace z.object({...})? Es una función de Zod que:

✔ Recibe:
Un objeto con un “shape” (estructura) donde cada propiedad es un schema de Zod.

z.object({
  campo: z.string(),
});

Es decir:
Record<string, ZodType>
*/

//Zod Schema        → runtime (valida datos reales)
//z.infer<>         → compile time (tipos TS)
// StadiumSchema = z.object({ name: z.string(), ubicacion: z.number() })
export const CreateEstadioSchema = z.object({
  // .trim() elimina espacios al inicio/fin antes de validar
  // .min(3) y .max(32) coinciden con el varchar(32) de la DB

  /* error solo aplica cuando el campo es undefined
    Ejemplo:
    nombre: undefined   // ❌ dispara error
    nombre: ""          // ❌ NO dispara error (es string vacío) */
  nombre: z
    .string({ error: "El nombre es requerido" })
    .trim()
    .min(1, "El nombre es requerido")
    .max(32, "El nombre no puede superar 32 caracteres"),

  ubicacion: z
    .string({ error: "La ubicación es requerida" })
    .trim()
    .min(1, "La ubicación esta vacia")
    .max(56, "La ubicación no puede superar 56 caracteres"),

  capacidad: z
    .number({ error: "La capacidad es requerida" })
    .int("La capacidad debe ser un número entero")
    .positive("La capacidad debe ser mayor a 0"),
});

// Tipo TypeScript inferido automáticamente del schema
export type CreateEstadioDto = z.infer<typeof CreateEstadioSchema>;

// ─── CLUB ─────────────────────────────────────────────────

export const CreateClubSchema = z.object({
  nombre: z
    .string({ error: "El nombre es requerido" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(16, "El nombre no puede superar 16 caracteres"),

  direccion: z
    .string({ error: "La dirección es requerida" })
    .trim()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(56, "La dirección no puede superar 56 caracteres"),

  ciudad: z
    .string({ error: "La ciudad es requerida" })
    .trim()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(56, "La ciudad no puede superar 56 caracteres"),

  // .optional() → el campo puede no venir en el body
  // .nullable() → el campo puede ser null
  // Usamos optional porque un club puede no tener estadio asignado aún
  estadio_id: z
    .number()
    .int("El ID de estadio debe ser un entero")
    .positive("El ID de estadio debe ser positivo")
    .optional(),
});

export type CreateClubDto = z.infer<typeof CreateClubSchema>;

// ─── PARTIDO ──────────────────────────────────────────────

export const CreatePartidoSchema = z
  .object({
    // Las fechas vienen como string desde HTTP, las validamos con regex
    // CONSEJO: Postgres acepta '2025-03-10' directamente como DATE
    fecha: z
      .string({ error: "La fecha es requerida" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),

    horario: z
      .string({ error: "El horario es requerido" })
      .regex(/^\d{2}:\d{2}$/, "El horario debe tener formato HH:MM"),

    goles_local: z
      .number({ error: "Los goles del local son requeridos" })
      .int()
      .min(0, "Los goles no pueden ser negativos"),

    goles_visita: z
      .number({ error: "Los goles de visita son requeridos" })
      .int()
      .min(0, "Los goles no pueden ser negativos"),

    estadio_id: z.number({ error: "El estadio es requerido" }).int().positive(),

    club_id_local: z
      .number({ error: "El club local es requerido" })
      .int()
      .positive(),

    club_id_visita: z
      .number({ error: "El club visitante es requerido" })
      .int()
      .positive(),
  })
  // .refine() permite validaciones cruzadas entre campos
  // Aquí replicamos el constraint de la DB: un club no puede jugar contra sí mismo
  .refine((data) => data.club_id_local !== data.club_id_visita, {
    message: "El club local y el visitante no pueden ser el mismo",
    path: ["club_id_visita"], // En qué campo aparece el error
  });

export type CreatePartidoDto = z.infer<typeof CreatePartidoSchema>;

// ─── SCHEMAS DE PARÁMETROS ────────────────────────────────

// Para validar :id en las rutas (ej: GET /estadios/5)
export const IdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "El ID debe ser un número entero positivo")
    .transform(Number), // Convierte string "5" a número 5
});

// Para el DELETE de partidos (clave compuesta)
export const DeletePartidoSchema = z.object({
  club_id_local: z.number().int().positive(),
  club_id_visita: z.number().int().positive(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type DeletePartidoDto = z.infer<typeof DeletePartidoSchema>;
