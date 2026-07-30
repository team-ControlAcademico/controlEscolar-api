import { Router } from "express";
import authRoutes from "./auth.routes";
import carreraRoutes from "./carrera.routes";
import planRoutes from "./plan.routes";
import materiaRoutes from "./materia.routes";
import cicloRoutes from "./ciclo.routes";
import grupoRoutes from "./grupo.routes";
import inscripcionRoutes from "./inscripcion.routes";
import alumnosRoutes from "./alumnos.routes";
import docentesRoutes from "./docentes.routes";
import asistenciaRoutes from "./asistencia.routes";
import calificacionRoutes from "./calificacion.routes";
import finanzasRoutes from "./finanzas.routes";
import comunicacionRoutes from "./comunicacion.routes";
import mensajeriaRoutes from "./mensajeria.routes";
import portalRoutes from "./portal.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/carreras", carreraRoutes);
router.use("/planes", planRoutes);
router.use("/materias", materiaRoutes);
router.use("/ciclos", cicloRoutes);
router.use("/grupos", grupoRoutes);
router.use("/inscripciones", inscripcionRoutes);
router.use("/alumnos", alumnosRoutes);
router.use("/docentes", docentesRoutes);
router.use("/asistencias", asistenciaRoutes);
router.use("/calificaciones", calificacionRoutes);
router.use("/finanzas", finanzasRoutes);
router.use("/comunicacion", comunicacionRoutes);
router.use("/mensajeria", mensajeriaRoutes);
router.use("/portal", portalRoutes);

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;

