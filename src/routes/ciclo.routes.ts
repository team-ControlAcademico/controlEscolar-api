import { Router } from "express";
import * as ciclo from "../controllers/ciclo.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "ESCOLAR"), ciclo.listar);
router.get("/:id", authorize("ADMIN", "ESCOLAR"), ciclo.obtener);
router.post("/", authorize("ADMIN", "ESCOLAR"), ciclo.crear);
router.put("/:id", authorize("ADMIN", "ESCOLAR"), ciclo.actualizar);
router.delete("/:id", authorize("ADMIN", "ESCOLAR"), ciclo.eliminar);
router.patch("/:id/toggle-activo", authorize("ADMIN", "ESCOLAR"), ciclo.alternarActivo);

export default router;
