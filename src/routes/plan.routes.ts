import { Router } from "express";
import * as plan from "../controllers/plan.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "ESCOLAR"), plan.listar);
router.get("/:id", authorize("ADMIN", "ESCOLAR"), plan.obtener);
router.post("/", authorize("ADMIN", "ESCOLAR"), plan.crear);
router.put("/:id", authorize("ADMIN", "ESCOLAR"), plan.actualizar);
router.delete("/:id", authorize("ADMIN", "ESCOLAR"), plan.eliminar);
router.post("/:id/materias", authorize("ADMIN", "ESCOLAR"), plan.agregarMateria);
router.delete("/:id/materias/:materiaId", authorize("ADMIN", "ESCOLAR"), plan.quitarMateria);

export default router;
