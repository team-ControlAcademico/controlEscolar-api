import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { obtenerDashboard, descargarReporteAlumnos } from "../controllers/estadisticas.controller";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN", "ESCOLAR"));

router.get("/dashboard", obtenerDashboard);
router.post("/exportar/alumnos", descargarReporteAlumnos);

export default router;
