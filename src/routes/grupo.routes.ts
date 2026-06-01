import { Router } from "express";
import * as grupo from "../controllers/grupo.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "ESCOLAR", "DOCENTE"), grupo.listar);
router.get("/:id", authorize("ADMIN", "ESCOLAR", "DOCENTE"), grupo.obtener);
router.post("/", authorize("ADMIN", "ESCOLAR"), grupo.crear);
router.put("/:id", authorize("ADMIN", "ESCOLAR"), grupo.actualizar);
router.delete("/:id", authorize("ADMIN", "ESCOLAR"), grupo.eliminar);
router.post("/:id/horarios", authorize("ADMIN", "ESCOLAR"), grupo.agregarHorario);
router.delete("/:id/horarios/:horarioId", authorize("ADMIN", "ESCOLAR"), grupo.quitarHorario);

export default router;
