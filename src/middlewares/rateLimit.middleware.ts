import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/**
 * Limitador global: protege toda la API de abuso/DoS por IP.
 * Se desactiva en entorno de pruebas para no interferir con los tests.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: { message: "Demasiadas peticiones. Intenta de nuevo más tarde." },
});

/**
 * Limitador estricto para endpoints sensibles de autenticación
 * (login, recuperación de contraseña): mitiga ataques de fuerza bruta.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: { message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." },
});
