import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "ESCOLAR", "ADMINISTRATIVO"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const alumnos = await prisma.alumnoProfile.findMany({
      include: {
        carrera: { select: { id: true, clave: true, nombre: true } },
        user: { select: { id: true, email: true, isActive: true } },
      },
      orderBy: { nombre: "asc" },
    });
    res.json({ data: alumnos });
  } catch (e) { next(e); }
});

router.get("/:id", authorize("ADMIN", "ESCOLAR", "ALUMNO"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alumno = await prisma.alumnoProfile.findUnique({
      where: { id: req.params.id },
      include: {
        carrera: true,
        user: { select: { id: true, email: true, isActive: true } },
        inscripciones: {
          include: {
            grupo: {
              include: {
                materia: { select: { id: true, clave: true, nombre: true, creditos: true } },
                cicloEscolar: { select: { id: true, nombre: true } },
                horarios: true,
              },
            },
          },
        },
      },
    });
    if (!alumno) {
      res.status(404).json({ message: "Alumno no encontrado" });
      return;
    }
    res.json({ data: alumno });
  } catch (e) { next(e); }
});

export default router;
