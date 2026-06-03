import { Router } from "express";
import * as carrera from "../controllers/carrera.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "ESCOLAR"), carrera.listar);
router.get("/:id", authorize("ADMIN", "ESCOLAR"), carrera.obtener);
router.post("/", authorize("ADMIN", "ESCOLAR"), carrera.crear);
router.put("/:id", authorize("ADMIN", "ESCOLAR"), carrera.actualizar);
router.delete("/:id", authorize("ADMIN", "ESCOLAR"), carrera.eliminar);

export default router;
