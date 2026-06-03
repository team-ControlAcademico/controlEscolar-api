import { Request, Response, NextFunction } from "express";
import { grupoSchema, grupoUpdateSchema, horarioSchema } from "../schemas/grupo.schema";
import * as grupoService from "../services/grupo.service";

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const params = {
      cicloId: req.query.cicloId as string | undefined,
      docenteId: req.query.docenteId as string | undefined,
    };
    const grupos = await grupoService.listarGrupos(params);
    res.json({ data: grupos });
  } catch (e) { next(e); }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const grupo = await grupoService.obtenerGrupo(req.params.id);
    res.json({ data: grupo });
  } catch (e) { next(e); }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = grupoSchema.parse(req.body);
    const grupo = await grupoService.crearGrupo(data);
    res.status(201).json({ message: "Grupo creado", data: grupo });
  } catch (e) { next(e); }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = grupoUpdateSchema.parse(req.body);
    const grupo = await grupoService.actualizarGrupo(req.params.id, data);
    res.json({ message: "Grupo actualizado", data: grupo });
  } catch (e) { next(e); }
}

export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    await grupoService.eliminarGrupo(req.params.id);
    res.json({ message: "Grupo eliminado" });
  } catch (e) { next(e); }
}

export async function agregarHorario(req: Request, res: Response, next: NextFunction) {
  try {
    const data = horarioSchema.parse(req.body);
    const horario = await grupoService.agregarHorario(req.params.id, data);
    res.status(201).json({ message: "Horario agregado", data: horario });
  } catch (e) { next(e); }
}

export async function quitarHorario(req: Request, res: Response, next: NextFunction) {
  try {
    await grupoService.quitarHorario(req.params.horarioId);
    res.json({ message: "Horario removido" });
  } catch (e) { next(e); }
}
