import { z } from "zod";

export const materiaSchema = z.object({
  clave: z.string().min(2, "Clave requerida"),
  nombre: z.string().min(2, "Nombre requerido"),
  creditos: z.coerce.number().int().min(0).default(0),
  tipo: z.enum(["OBLIGATORIA", "OPTATIVA"]).default("OBLIGATORIA"),
  descripcion: z.string().optional().or(z.literal("")),
});

export const materiaUpdateSchema = materiaSchema.partial();

export const prerequisitoSchema = z.object({
  prerequisitoId: z.string().uuid("Prerequisito inválido"),
});

export type MateriaInput = z.infer<typeof materiaSchema>;
export type MateriaUpdateInput = z.infer<typeof materiaUpdateSchema>;
