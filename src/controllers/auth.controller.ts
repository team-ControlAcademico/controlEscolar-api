import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema, refreshTokenSchema } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.registerUser(data);
    res.status(201).json({ message: "Usuario registrado exitosamente", user });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.authenticateUser(data.email, data.password);
    res.json({ message: "Inicio de sesión exitoso", ...result });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const tokens = await authService.refreshUserToken(refreshToken);
    res.json({ message: "Token renovado", ...tokens });
  } catch (error) {
    next(error);
  }
}

export async function profile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    await authService.logoutUser(refreshToken);
    res.json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    next(error);
  }
}
