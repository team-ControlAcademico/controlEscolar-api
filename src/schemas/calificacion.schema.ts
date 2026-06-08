import { z } from "zod";

export const registroCalificacionItemSchema = z.object({
  alumnoId: z.string().uuid("Alumno inválido"),
  calificacion: z.coerce.number().min(0, "Mínimo 0").max(10, "Máximo 10"),
});

export const registrarCalificacionesBatchSchema = z.object({
  unidad: z.coerce.number().int().min(1, "Unidad mínima 1").max(3, "Unidad máxima 3"),
  tipo: z.enum(["ORDINARIO", "EXTRAORDINARIO", "TITULO"]).default("ORDINARIO"),
  registros: z.array(registroCalificacionItemSchema).min(1, "Se requiere al menos un registro"),
});

export type RegistrarCalificacionesBatchInput = z.infer<typeof registrarCalificacionesBatchSchema>;
export type CalificacionRegistroItem = z.infer<typeof registroCalificacionItemSchema>;
