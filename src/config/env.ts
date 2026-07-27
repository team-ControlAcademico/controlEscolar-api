import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16).default("dev-jwt-secret-change-in-production"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev-refresh-secret-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // ─── FASE 4: Finanzas ───
  FINANZAS_ENCRYPTION_KEY: z.string().min(16).default("dev-finanzas-encryption-key-change-me"),
  STRIPE_WEBHOOK_SECRET: z.string().default("dev-stripe-webhook-secret"),
  IVA_RATE: z.coerce.number().min(0).max(1).default(0.16), // IVA 16% México
});

export const env = envSchema.parse(process.env);
