import { Router } from "express";
import * as materia from "../controllers/materia.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN", "ESCOLAR"), materia.listar);
router.get("/:id", authorize("ADMIN", "ESCOLAR"), materia.obtener);
router.post("/", authorize("ADMIN", "ESCOLAR"), materia.crear);
router.put("/:id", authorize("ADMIN", "ESCOLAR"), materia.actualizar);
router.delete("/:id", authorize("ADMIN", "ESCOLAR"), materia.eliminar);
router.post("/:id/prerequisitos", authorize("ADMIN", "ESCOLAR"), materia.agregarPrerequisito);
router.delete("/:id/prerequisitos/:prerequisitoId", authorize("ADMIN", "ESCOLAR"), materia.quitarPrerequisito);

export default router;
