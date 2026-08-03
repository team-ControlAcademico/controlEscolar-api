import { z } from "zod";

export const crearUsuarioSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "ESCOLAR", "ADMINISTRATIVO", "DOCENTE", "ALUMNO", "PADRE"]),
  nombre: z.string().min(1, "El nombre es requerido"),
  curp: z.string().optional().or(z.literal("")),
  // Campos condicionales por rol
  especialidad: z.string().optional().or(z.literal("")),
  gradoAcademico: z.string().optional().or(z.literal("")),
  departamento: z.string().optional().or(z.literal("")),
  matricula: z.string().optional().or(z.literal("")),
  semestre: z.coerce.number().optional(),
});

export const actualizarUsuarioSchema = z.object({
  email: z.string().email("Correo electrónico inválido").optional(),
  nombre: z.string().min(1, "El nombre es requerido").optional(),
  curp: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  // Campos condicionales por rol
  especialidad: z.string().optional().or(z.literal("")),
  gradoAcademico: z.string().optional().or(z.literal("")),
  departamento: z.string().optional().or(z.literal("")),
  matricula: z.string().optional().or(z.literal("")),
  semestre: z.coerce.number().optional(),
});

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>;
