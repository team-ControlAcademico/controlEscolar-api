import { Router } from "express";
import * as asistencia from "../controllers/asistencia.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Registrar asistencia masiva para un grupo
router.post("/grupo/:grupoId", authorize("DOCENTE", "ADMIN", "ESCOLAR"), asistencia.registrarBatch);

// Listar asistencia de un grupo (filtro opcional por fecha)
router.get("/grupo/:grupoId", authorize("DOCENTE", "ADMIN", "ESCOLAR"), asistencia.listarPorGrupo);

// Estadísticas de asistencia de un grupo
router.get("/grupo/:grupoId/estadisticas", authorize("DOCENTE", "ADMIN", "ESCOLAR"), asistencia.estadisticas);

// Fechas con asistencia registrada para un grupo
router.get("/grupo/:grupoId/fechas", authorize("DOCENTE", "ADMIN", "ESCOLAR"), asistencia.fechasConAsistencia);

// Historial de asistencia de un alumno
router.get("/alumno/:alumnoId", authorize("ALUMNO", "PADRE", "DOCENTE", "ADMIN", "ESCOLAR"), asistencia.listarPorAlumno);

export default router;
