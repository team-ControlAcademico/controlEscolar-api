import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "ESCOLAR"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const docentes = await prisma.docenteProfile.findMany({
      include: {
        user: { select: { id: true, email: true, isActive: true } },
      },
      orderBy: { nombre: "asc" },
    });
    res.json({ data: docentes });
  } catch (e) { next(e); }
});

export default router;
