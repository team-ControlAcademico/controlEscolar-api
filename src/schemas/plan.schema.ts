import { z } from "zod";

export const planEstudioSchema = z.object({
  clave: z.string().min(2, "Clave requerida"),
  nombre: z.string().min(2, "Nombre requerido"),
  vigente: z.boolean().default(true),
  carreraId: z.string().uuid("Carrera inválida"),
});

export const planEstudioUpdateSchema = planEstudioSchema.partial();

export const agregarMateriaSchema = z.object({
  materiaId: z.string().uuid("Materia inválida"),
  semestre: z.coerce.number().int().min(1).max(12),
});

export type PlanEstudioInput = z.infer<typeof planEstudioSchema>;
export type PlanEstudioUpdateInput = z.infer<typeof planEstudioUpdateSchema>;
