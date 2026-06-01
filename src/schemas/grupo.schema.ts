import { z } from "zod";

export const grupoSchema = z.object({
  clave: z.string().min(2, "Clave requerida"),
  materiaId: z.string().uuid("Materia inválida"),
  cicloEscolarId: z.string().uuid("Ciclo escolar inválido"),
  docenteId: z.string().uuid("Docente inválido"),
  aula: z.string().optional().or(z.literal("")),
  cupoMaximo: z.coerce.number().int().min(1).max(200).default(30),
});

export const grupoUpdateSchema = grupoSchema.partial();

export const horarioSchema = z.object({
  dia: z.enum(["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"]),
  horaInicio: z.string().min(1, "Hora de inicio requerida"),
  horaFin: z.string().min(1, "Hora de fin requerida"),
  aula: z.string().optional().or(z.literal("")),
});

export type GrupoInput = z.infer<typeof grupoSchema>;
export type GrupoUpdateInput = z.infer<typeof grupoUpdateSchema>;
export type HorarioInput = z.infer<typeof horarioSchema>;
