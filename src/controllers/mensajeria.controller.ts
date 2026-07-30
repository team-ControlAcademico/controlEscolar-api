import { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { crearConversacionSchema, enviarMensajeSchema } from "../schemas/mensaje.schema";
import * as mensajeService from "../services/mensaje.service";

export async function listarConversaciones(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const data = await mensajeService.listarConversaciones(req.user.userId);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function crearConversacion(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const { participanteId } = crearConversacionSchema.parse(req.body);
    const data = await mensajeService.crearConversacion(req.user.userId, participanteId);
    res.status(201).json({ message: "Conversación creada", data });
  } catch (e) { next(e); }
}

export async function listarMensajes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const data = await mensajeService.listarMensajes(req.params.id, req.user.userId);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function enviarMensaje(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const { contenido } = enviarMensajeSchema.parse(req.body);
    const result = await mensajeService.enviarMensaje(req.params.id, req.user.userId, contenido);

    // Emitir mensaje en tiempo real al destinatario via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${result.destinatarioId}`).emit("mensaje:nuevo", {
        conversacionId: result.conversacionId,
        mensaje: result.mensaje,
      });
    }

    res.status(201).json({ message: "Mensaje enviado", data: result.mensaje });
  } catch (e) { next(e); }
}

export async function listarUsuariosDisponibles(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) { res.status(401).json({ message: "No autenticado" }); return; }
    const data = await mensajeService.listarUsuariosDisponibles(req.user.userId);
    res.json({ data });
  } catch (e) { next(e); }
}
