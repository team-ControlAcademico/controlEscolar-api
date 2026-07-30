import { Router } from "express";
import * as comunicacion from "../controllers/comunicacion.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// ─── Mis avisos (para el usuario autenticado) ───
router.get("/mis-avisos", comunicacion.misAvisos);
router.get("/mis-avisos/no-leidos", comunicacion.contadorNoLeidos);

// ─── CRUD Avisos ───
router.get("/avisos", comunicacion.listarAvisos);
router.get("/avisos/:id", comunicacion.obtenerAviso);
router.post("/avisos", authorize("ADMIN", "ESCOLAR", "DOCENTE"), comunicacion.crearAviso);
router.delete("/avisos/:id", authorize("ADMIN", "ESCOLAR"), comunicacion.eliminarAviso);

// ─── Marcar como leído ───
router.post("/avisos/:id/leido", comunicacion.marcarLeido);

export default router;
