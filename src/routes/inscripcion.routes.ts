import { Router } from "express";
import * as inscripcion from "../controllers/inscripcion.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "ESCOLAR", "ADMINISTRATIVO", "ALUMNO", "DOCENTE"), inscripcion.listar);
router.get("/:id", authorize("ADMIN", "ESCOLAR", "ADMINISTRATIVO", "ALUMNO", "DOCENTE"), inscripcion.obtener);
router.post("/", authorize("ADMIN", "ESCOLAR", "ADMINISTRATIVO"), inscripcion.inscribir);
router.patch("/:id/estatus", authorize("ADMIN", "ESCOLAR"), inscripcion.cambiarEstatus);
router.delete("/:id", authorize("ADMIN", "ESCOLAR"), inscripcion.eliminar);

export default router;
