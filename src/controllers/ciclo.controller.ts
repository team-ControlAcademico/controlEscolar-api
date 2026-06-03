import { Request, Response, NextFunction } from "express";
import { cicloEscolarSchema, cicloEscolarUpdateSchema } from "../schemas/ciclo.schema";
import * as cicloService from "../services/ciclo.service";

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    const ciclos = await cicloService.listarCiclos();
    res.json({ data: ciclos });
  } catch (e) { next(e); }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const ciclo = await cicloService.obtenerCiclo(req.params.id);
    res.json({ data: ciclo });
  } catch (e) { next(e); }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = cicloEscolarSchema.parse(req.body);
    const ciclo = await cicloService.crearCiclo(data);
    res.status(201).json({ message: "Ciclo escolar creado", data: ciclo });
  } catch (e) { next(e); }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = cicloEscolarUpdateSchema.parse(req.body);
    const ciclo = await cicloService.actualizarCiclo(req.params.id, data);
    res.json({ message: "Ciclo actualizado", data: ciclo });
  } catch (e) { next(e); }
}

export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    await cicloService.eliminarCiclo(req.params.id);
    res.json({ message: "Ciclo eliminado" });
  } catch (e) { next(e); }
}

export async function alternarActivo(req: Request, res: Response, next: NextFunction) {
  try {
    const ciclo = await cicloService.alternarActivoCiclo(req.params.id);
    res.json({ message: "Estado del ciclo actualizado", data: ciclo });
  } catch (e) { next(e); }
}
