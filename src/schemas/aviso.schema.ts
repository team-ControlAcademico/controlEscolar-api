import { z } from "zod";

export const crearAvisoSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(200),
  contenido: z.string().min(1, "El contenido es requerido").max(5000),
  tipo: z.enum(["GENERAL", "ACADEMICO", "FINANCIERO", "URGENTE"]).default("GENERAL"),
  rolesDestino: z
    .array(z.enum(["ADMIN", "ESCOLAR", "ADMINISTRATIVO", "DOCENTE", "ALUMNO", "PADRE"]))
    .min(1, "Debe seleccionar al menos un rol destino"),
  fechaExpiracion: z.string().datetime().optional().or(z.string().date().optional()),
});

export const avisoUpdateSchema = crearAvisoSchema.partial();
