import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.nativeEnum(Role),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  curp: z.string().length(18, "CURP debe tener 18 caracteres").optional().or(z.literal("")),
  especialidad: z.string().optional().or(z.literal("")),
  gradoAcademico: z.string().optional().or(z.literal("")),
  departamento: z.string().optional().or(z.literal("")),
  matricula: z.string().optional().or(z.literal("")),
  semestre: z.coerce.number().int().min(1).max(12).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Correo electrónico inválido"),
  password: z.string().trim().min(1, "La contraseña es requerida"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token requerido"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Correo electrónico inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
