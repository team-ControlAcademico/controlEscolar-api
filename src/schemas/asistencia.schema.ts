import { z } from "zod";

export const registroAsistenciaItemSchema = z.object({
  alumnoId: z.string().uuid("Alumno inválido"),
  presente: z.boolean(),
  justificacion: z.string().optional().or(z.literal("")),
});

export const registrarAsistenciaBatchSchema = z.object({
  fecha: z.string().min(1, "Fecha requerida"), // YYYY-MM-DD
  registros: z.array(registroAsistenciaItemSchema).min(1, "Se requiere al menos un registro"),
});

export const asistenciaQuerySchema = z.object({
  fecha: z.string().optional(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
});

export type RegistrarAsistenciaBatchInput = z.infer<typeof registrarAsistenciaBatchSchema>;
export type AsistenciaRegistroItem = z.infer<typeof registroAsistenciaItemSchema>;
