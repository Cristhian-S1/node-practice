import { z } from "zod";

// Estadio
// StadiumSchema = z.object({ name: z.string(), ubicacion: z.number() })
export const StadiumSchema = z.object({
  nombre: z
    .string({ error: "name is not string!" })
    .trim()
    .min(1, "name is empty!")
    .max(32, "maximum 32 characters"),

  ubicacion: z
    .string({ error: "ubication is not string!" })
    .trim()
    .min(1, "ubication is empty!")
    .max(56, "maximum 56 characters"),

  capacidad: z
    .number({ error: "capacity is not number!" })
    .int("Only integers (not floats)")
    .positive("Only positive"),
});

// This type is {name: string, ubication: string, capacity: number} -> ZodObject<{}>
export type StadiumDto = z.infer<typeof StadiumSchema>;
