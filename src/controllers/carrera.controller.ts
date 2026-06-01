import { Request, Response, NextFunction } from "express";
import { carreraSchema, carreraUpdateSchema } from "../schemas/carrera.schema";
import * as carreraService from "../services/carrera.service";

export async function listar(_req: Request, res: Response, next: NextFunction) {
  try {
    const carreras = await carreraService.listarCarreras();
    res.json({ data: carreras });
  } catch (e) { next(e); }
}

export async function obtener(req: Request, res: Response, next: NextFunction) {
  try {
    const carrera = await carreraService.obtenerCarrera(req.params.id);
    res.json({ data: carrera });
  } catch (e) { next(e); }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const data = carreraSchema.parse(req.body);
    const carrera = await carreraService.crearCarrera(data);
    res.status(201).json({ message: "Carrera creada", data: carrera });
  } catch (e) { next(e); }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = carreraUpdateSchema.parse(req.body);
    const carrera = await carreraService.actualizarCarrera(req.params.id, data);
    res.json({ message: "Carrera actualizada", data: carrera });
  } catch (e) { next(e); }
}

export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    await carreraService.eliminarCarrera(req.params.id);
    res.json({ message: "Carrera eliminada" });
  } catch (e) { next(e); }
}
