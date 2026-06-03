import { z } from "zod";

export const carreraSchema = z.object({
  clave: z.string().min(2, "Clave requerida"),
  nombre: z.string().min(2, "Nombre requerido"),
  descripcion: z.string().optional().or(z.literal("")),
  creditosTotales: z.coerce.number().int().min(0).default(0),
  duracionSemestres: z.coerce.number().int().min(1).max(12).default(8),
  activa: z.boolean().default(true),
});

export const carreraUpdateSchema = carreraSchema.partial();

export type CarreraInput = z.infer<typeof carreraSchema>;
export type CarreraUpdateInput = z.infer<typeof carreraUpdateSchema>;
