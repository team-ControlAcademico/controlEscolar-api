import { Request, Response, NextFunction } from "express";
import { inscribirSchema, cambiarEstatusSchema } from "../schemas/inscripcion.schema";
import * as inscripcionService from "../services/inscripcion.service";

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const params = {
      grupoId: req.query.grupoId as string | undefined,
      alumnoId: req.query.alumnoId as string | undefined,
    };
    const inscripciones = await inscripcionService.listarInscripciones(params);
    res.json({ data: inscripciones });
  } catch (e) { next(e); }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const inscripcion = await inscripcionService.obtenerInscripcion(req.params.id);
    res.json({ data: inscripcion });
  } catch (e) { next(e); }
}

export async function inscribir(req: Request, res: Response, next: NextFunction) {
  try {
    const data = inscribirSchema.parse(req.body);
    const inscripcion = await inscripcionService.inscribirAlumno(data);
    res.status(201).json({ message: "Alumno inscrito", data: inscripcion });
  } catch (e) { next(e); }
}

export async function cambiarEstatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { estatus } = cambiarEstatusSchema.parse(req.body);
    const inscripcion = await inscripcionService.cambiarEstatusInscripcion(req.params.id, estatus);
    res.json({ message: "Estatus actualizado", data: inscripcion });
  } catch (e) { next(e); }
}

export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    await inscripcionService.eliminarInscripcion(req.params.id);
    res.json({ message: "Inscripción eliminada" });
  } catch (e) { next(e); }
}
