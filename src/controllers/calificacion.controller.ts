import { Request, Response, NextFunction } from "express";
import { registrarCalificacionesBatchSchema } from "../schemas/calificacion.schema";
import * as calificacionService from "../services/calificacion.service";
import type { AuthRequest } from "../middlewares/auth.middleware";

export async function registrarBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registrarCalificacionesBatchSchema.parse(req.body);
    const result = await calificacionService.registrarCalificacionesBatch(req.params.grupoId, data);
    res.status(201).json({ message: "Calificaciones registradas", data: result });
  } catch (e) { next(e); }
}

export async function listarPorGrupo(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await calificacionService.obtenerCalificacionesPorGrupo(req.params.grupoId);
    res.json({ data: result });
  } catch (e) { next(e); }
}

export async function boleta(req: Request, res: Response, next: NextFunction) {
  try {
    const cicloEscolarId = req.query.cicloEscolarId as string | undefined;
    const result = await calificacionService.obtenerBoletaAlumno(req.params.alumnoId, cicloEscolarId);
    res.json({ data: result });
  } catch (e) { next(e); }
}

export async function misCalificaciones(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autenticado" });
      return;
    }
    const cicloEscolarId = req.query.cicloEscolarId as string | undefined;
    const result = await calificacionService.obtenerMisCalificaciones(req.user.userId, cicloEscolarId);
    res.json({ data: result });
  } catch (e) { next(e); }
}
