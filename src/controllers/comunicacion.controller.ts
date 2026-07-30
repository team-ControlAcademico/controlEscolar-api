import { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { crearAvisoSchema } from "../schemas/aviso.schema";
import * as avisoService from "../services/aviso.service";

export async function crearAviso(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const input = crearAvisoSchema.parse(req.body);
    const data = await avisoService.crearAviso(req.user.userId, input);
    // Emitir aviso a los roles destino via Socket.io (si disponible)
    const io = req.app.get("io");
    if (io) {
      for (const role of input.rolesDestino) {
        io.to(`role:${role}`).emit("aviso:nuevo", data);
      }
    }
    res.status(201).json({ message: "Aviso creado", data });
  } catch (e) { next(e); }
}

export async function listarAvisos(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await avisoService.listarAvisos({
      tipo: req.query.tipo as string | undefined,
    });
    res.json({ data });
  } catch (e) { next(e); }
}

export async function obtenerAviso(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await avisoService.obtenerAviso(req.params.id);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function eliminarAviso(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await avisoService.eliminarAviso(req.params.id);
    res.json({ message: "Aviso eliminado" });
  } catch (e) { next(e); }
}

export async function marcarLeido(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const data = await avisoService.marcarLeido(req.params.id, req.user.userId);
    res.json({ message: "Aviso marcado como leído", data });
  } catch (e) { next(e); }
}

export async function misAvisos(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const data = await avisoService.misAvisos(req.user.userId, req.user.role);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function contadorNoLeidos(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const count = await avisoService.contadorNoLeidos(req.user.userId, req.user.role);
    res.json({ data: { count } });
  } catch (e) { next(e); }
}
