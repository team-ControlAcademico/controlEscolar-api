import { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import * as portalService from "../services/portal.service";

export async function portalAlumno(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const data = await portalService.portalAlumno(req.user.userId);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function portalDocente(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const data = await portalService.portalDocente(req.user.userId);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function portalPadre(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const data = await portalService.portalPadre(req.user.userId);
    res.json({ data });
  } catch (e) { next(e); }
}
