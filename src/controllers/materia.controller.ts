import { Request, Response, NextFunction } from "express";
import { materiaSchema, materiaUpdateSchema } from "../schemas/materia.schema";
import * as materiaService from "../services/materia.service";

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    const materias = await materiaService.listarMaterias();
    res.json({ data: materias });
  } catch (e) { next(e); }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const materia = await materiaService.obtenerMateria(req.params.id);
    res.json({ data: materia });
  } catch (e) { next(e); }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = materiaSchema.parse(req.body);
    const materia = await materiaService.crearMateria(data);
    res.status(201).json({ message: "Materia creada", data: materia });
  } catch (e) { next(e); }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = materiaUpdateSchema.parse(req.body);
    const materia = await materiaService.actualizarMateria(req.params.id, data);
    res.json({ message: "Materia actualizada", data: materia });
  } catch (e) { next(e); }
}

export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    await materiaService.eliminarMateria(req.params.id);
    res.json({ message: "Materia eliminada" });
  } catch (e) { next(e); }
}

export async function agregarPrerequisito(req: Request, res: Response, next: NextFunction) {
  try {
    const { prerequisitoId } = req.body;
    const result = await materiaService.agregarPrerequisito(req.params.id, prerequisitoId);
    res.status(201).json({ message: "Prerequisito agregado", data: result });
  } catch (e) { next(e); }
}

export async function quitarPrerequisito(req: Request, res: Response, next: NextFunction) {
  try {
    await materiaService.quitarPrerequisito(req.params.prerequisitoId);
    res.json({ message: "Prerequisito removido" });
  } catch (e) { next(e); }
}
