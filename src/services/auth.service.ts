import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PrismaClient, Role } from "@prisma/client";
import { RegisterInput } from "../schemas/auth.schema";
import { AppError } from "../middlewares/error.middleware";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { enviarCorreo, correoRecuperacion } from "./email.service";

const prisma = new PrismaClient();

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError("El correo ya está registrado", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });

  await createProfile(user.id, data);

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function createProfile(userId: string, data: RegisterInput) {
  const profile = { nombre: data.nombre, curp: data.curp || null };

  switch (data.role) {
    case "ADMIN":
      await prisma.adminProfile.create({ data: { ...profile, userId } });
      break;
    case "ESCOLAR":
      await prisma.escolarProfile.create({ data: { ...profile, userId } });
      break;
    case "ADMINISTRATIVO":
      await prisma.administrativoProfile.create({
        data: { ...profile, departamento: data.departamento || null, userId },
      });
      break;
    case "DOCENTE":
      await prisma.docenteProfile.create({
        data: {
          ...profile,
          especialidad: data.especialidad || null,
          gradoAcademico: data.gradoAcademico || null,
          userId,
        },
      });
      break;
    case "ALUMNO":
      if (!data.matricula) {
        throw new AppError("La matrícula es requerida para alumnos", 400);
      }
      await prisma.alumnoProfile.create({
        data: {
          ...profile,
          matricula: data.matricula,
          semestre: data.semestre ?? 1,
          userId,
        },
      });
      break;
    case "PADRE":
      await prisma.padreProfile.create({ data: { ...profile, userId } });
      break;
    default:
      throw new AppError("Rol no válido", 400);
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      admin: true,
      escolar: true,
      administrativo: true,
      docente: true,
      alumno: true,
      padre: true,
    },
  });
  if (!user) {
    throw new AppError("Credenciales inválidas", 401);
  }

  if (!user.isActive) {
    throw new AppError("Cuenta desactivada. Contacta al administrador.", 403);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

export async function refreshUserToken(token: string) {
  const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.deleteMany({ where: { token } });
    throw new AppError("Refresh token inválido o expirado", 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError("Refresh token inválido", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) {
    throw new AppError("Usuario no encontrado o inactivo", 401);
  }

  const newPayload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);

  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return { accessToken, refreshToken };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      admin: true,
      escolar: true,
      administrativo: true,
      docente: true,
      alumno: true,
      padre: true,
    },
  });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function logoutUser(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

/**
 * Genera un token temporal de recuperación y lo envía por correo.
 * Por seguridad NO revela si el correo existe (respuesta uniforme en el controller).
 */
export async function solicitarRecuperacion(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return;

  // Invalida tokens previos sin usar para este usuario.
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const { subject, text } = correoRecuperacion(token);
  await enviarCorreo({ to: user.email, subject, text });
}

/**
 * Restablece la contraseña a partir de un token válido y no expirado.
 * Marca el token como usado y revoca todas las sesiones activas.
 */
export async function restablecerPassword(token: string, nuevaPassword: string) {
  const stored = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
    throw new AppError("Token inválido o expirado", 400);
  }

  const hashedPassword = await bcrypt.hash(nuevaPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: stored.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: stored.id },
      data: { usedAt: new Date() },
    }),
    // Revoca refresh tokens: las sesiones existentes quedan invalidadas.
    prisma.refreshToken.deleteMany({ where: { userId: stored.userId } }),
  ]);
}
