import { z } from "zod";

export const cicloEscolarSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  fechaInicio: z.string().min(1, "Fecha de inicio requerida"),
  fechaFin: z.string().min(1, "Fecha de fin requerida"),
  tipo: z.enum(["CUATRIMESTRAL", "MODULAR", "RECURSAMIENTO"]).default("CUATRIMESTRAL"),
  activo: z.boolean().default(true),
});

export const cicloEscolarUpdateSchema = cicloEscolarSchema.partial();

export type CicloEscolarInput = z.infer<typeof cicloEscolarSchema>;
export type CicloEscolarUpdateInput = z.infer<typeof cicloEscolarUpdateSchema>;
