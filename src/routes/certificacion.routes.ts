import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  obtenerKardex,
  descargarKardexPDF,
  listarTramitesTitulacion,
  actualizarEstadoTitulacion,
} from "../controllers/certificacion.controller";

const router = Router();

// Todos los endpoints de certificación requieren autenticación
router.use(authenticate);

// Kardex
router.get("/alumnos/:alumnoId/kardex", obtenerKardex);
router.post("/alumnos/:alumnoId/kardex/pdf", descargarKardexPDF); // Uso POST si quiero generar, o GET.

// Titulación
router.get("/titulacion", authorize("ADMIN", "ESCOLAR"), listarTramitesTitulacion);
router.put("/titulacion/:id/estado", authorize("ADMIN", "ESCOLAR"), actualizarEstadoTitulacion);

export default router;
