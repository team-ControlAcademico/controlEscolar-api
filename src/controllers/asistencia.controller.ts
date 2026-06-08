import { Request, Response, NextFunction } from "express";
import { registrarAsistenciaBatchSchema } from "../schemas/asistencia.schema";
import * as asistenciaService from "../services/asistencia.service";

export async function registrarBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registrarAsistenciaBatchSchema.parse(req.body);
    const result = await asistenciaService.registrarAsistenciaBatch(req.params.grupoId, data);
    res.status(201).json({ message: "Asistencia registrada", data: result });
  } catch (e) { next(e); }
}

export async function listarPorGrupo(req: Request, res: Response, next: NextFunction) {
  try {
    const fecha = req.query.fecha as string | undefined;
    const asistencias = await asistenciaService.obtenerAsistenciaPorGrupo(req.params.grupoId, fecha);
    res.json({ data: asistencias });
  } catch (e) { next(e); }
}

export async function listarPorAlumno(req: Request, res: Response, next: NextFunction) {
  try {
    const grupoId = req.query.grupoId as string | undefined;
    const asistencias = await asistenciaService.obtenerAsistenciaPorAlumno(req.params.alumnoId, grupoId);
    res.json({ data: asistencias });
  } catch (e) { next(e); }
}

export async function estadisticas(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await asistenciaService.obtenerEstadisticas(req.params.grupoId);
    res.json({ data: stats });
  } catch (e) { next(e); }
}

export async function fechasConAsistencia(req: Request, res: Response, next: NextFunction) {
  try {
    const fechas = await asistenciaService.obtenerFechasConAsistencia(req.params.grupoId);
    res.json({ data: fechas });
  } catch (e) { next(e); }
}
