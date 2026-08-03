import { Request, Response, NextFunction } from "express";
import { crearUsuarioSchema, actualizarUsuarioSchema } from "../schemas/usuario.schema";
import * as usuarioService from "../services/usuario.service";

export async function listarUsuarios(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.query.role as string | undefined;
    const busqueda = req.query.busqueda as string | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;

    const data = await usuarioService.listarUsuarios({ role, busqueda, isActive });
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function obtenerUsuario(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await usuarioService.obtenerUsuario(req.params.id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function crearUsuario(req: Request, res: Response, next: NextFunction) {
  try {
    const input = crearUsuarioSchema.parse(req.body);
    const data = await usuarioService.crearUsuario(input);
    res.status(201).json({ message: "Usuario creado exitosamente", data });
  } catch (error) {
    next(error);
  }
}

export async function actualizarUsuario(req: Request, res: Response, next: NextFunction) {
  try {
    const input = actualizarUsuarioSchema.parse(req.body);
    const data = await usuarioService.actualizarUsuario(req.params.id, input);
    res.json({ message: "Usuario actualizado exitosamente", data });
  } catch (error) {
    next(error);
  }
}

export async function eliminarUsuario(req: Request, res: Response, next: NextFunction) {
  try {
    await usuarioService.eliminarUsuario(req.params.id);
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    next(error);
  }
}

export async function toggleActivar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await usuarioService.toggleActivar(req.params.id);
    res.json({ message: "Estatus de usuario actualizado exitosamente", data });
  } catch (error) {
    next(error);
  }
}
