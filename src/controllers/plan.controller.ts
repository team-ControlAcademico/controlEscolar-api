import { Request, Response, NextFunction } from "express";
import { planEstudioSchema, planEstudioUpdateSchema, agregarMateriaSchema } from "../schemas/plan.schema";
import * as planService from "../services/plan.service";

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    const planes = await planService.listarPlanes();
    res.json({ data: planes });
  } catch (e) { next(e); }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await planService.obtenerPlan(req.params.id);
    res.json({ data: plan });
  } catch (e) { next(e); }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = planEstudioSchema.parse(req.body);
    const plan = await planService.crearPlan(data);
    res.status(201).json({ message: "Plan de estudio creado", data: plan });
  } catch (e) { next(e); }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = planEstudioUpdateSchema.parse(req.body);
    const plan = await planService.actualizarPlan(req.params.id, data);
    res.json({ message: "Plan actualizado", data: plan });
  } catch (e) { next(e); }
}

export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    await planService.eliminarPlan(req.params.id);
    res.json({ message: "Plan eliminado" });
  } catch (e) { next(e); }
}

export async function agregarMateria(req: Request, res: Response, next: NextFunction) {
  try {
    const { materiaId, semestre } = agregarMateriaSchema.parse(req.body);
    const pm = await planService.agregarMateriaPlan(req.params.id, materiaId, semestre);
    res.status(201).json({ message: "Materia agregada al plan", data: pm });
  } catch (e) { next(e); }
}

export async function quitarMateria(req: Request, res: Response, next: NextFunction) {
  try {
    await planService.quitarMateriaPlan(req.params.materiaId);
    res.json({ message: "Materia removida del plan" });
  } catch (e) { next(e); }
}
