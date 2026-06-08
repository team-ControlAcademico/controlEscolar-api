import { Router } from "express";
import * as calificacion from "../controllers/calificacion.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Registrar calificaciones masivas para un grupo
router.post("/grupo/:grupoId", authorize("DOCENTE", "ADMIN", "ESCOLAR"), calificacion.registrarBatch);

// Listar calificaciones de un grupo (matriz completa)
router.get("/grupo/:grupoId", authorize("DOCENTE", "ADMIN", "ESCOLAR"), calificacion.listarPorGrupo);

// Boleta de un alumno específico
router.get("/alumno/:alumnoId/boleta", authorize("ALUMNO", "PADRE", "ADMIN", "ESCOLAR"), calificacion.boleta);

// Mis calificaciones (alumno autenticado)
router.get("/mis-calificaciones", authorize("ALUMNO"), calificacion.misCalificaciones);

export default router;
