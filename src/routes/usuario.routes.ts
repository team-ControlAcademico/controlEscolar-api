import { Router } from "express";
import * as usuario from "../controllers/usuario.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

const GESTION = ["ADMIN", "ESCOLAR"] as const;

router.get("/", authorize(...GESTION), usuario.listarUsuarios);
router.get("/:id", authorize(...GESTION), usuario.obtenerUsuario);
router.post("/", authorize(...GESTION), usuario.crearUsuario);
router.put("/:id", authorize(...GESTION), usuario.actualizarUsuario);
router.delete("/:id", authorize(...GESTION), usuario.eliminarUsuario);
router.patch("/:id/toggle-activo", authorize(...GESTION), usuario.toggleActivar);

export default router;
