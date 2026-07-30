import { Router } from "express";
import * as mensajeria from "../controllers/mensajeria.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// ─── Conversaciones ───
router.get("/conversaciones", mensajeria.listarConversaciones);
router.post("/conversaciones", mensajeria.crearConversacion);

// ─── Mensajes dentro de una conversación ───
router.get("/conversaciones/:id/mensajes", mensajeria.listarMensajes);
router.post("/conversaciones/:id/mensajes", mensajeria.enviarMensaje);

// ─── Usuarios disponibles para nuevo chat ───
router.get("/usuarios-disponibles", mensajeria.listarUsuariosDisponibles);

export default router;
