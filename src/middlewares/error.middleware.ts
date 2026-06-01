import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error("[Error]", err.message);

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Error interno del servidor",
  });
}

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
