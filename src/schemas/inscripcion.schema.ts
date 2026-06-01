import { z } from "zod";

export const inscribirSchema = z.object({
  alumnoId: z.string().uuid("Alumno inválido"),
  grupoId: z.string().uuid("Grupo inválido"),
});

export const cambiarEstatusSchema = z.object({
  estatus: z.enum(["INSCRITO", "BAJA", "REPROBADO", "APROBADO"]),
});

export type InscribirInput = z.infer<typeof inscribirSchema>;
