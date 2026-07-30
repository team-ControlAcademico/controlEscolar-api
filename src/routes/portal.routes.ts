import { Router } from "express";
import * as portal from "../controllers/portal.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/alumno", authorize("ALUMNO"), portal.portalAlumno);
router.get("/docente", authorize("DOCENTE"), portal.portalDocente);
router.get("/padre", authorize("PADRE"), portal.portalPadre);

export default router;
