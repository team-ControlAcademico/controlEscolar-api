import { Router } from "express";
import * as finanzas from "../controllers/finanzas.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// Webhook público: la autenticidad se valida por firma HMAC, no por JWT.
router.post("/webhooks/pago", finanzas.webhookPago);

router.use(authenticate);

const GESTION = ["ADMIN", "ADMINISTRATIVO"] as const;

// ─── Colegiaturas ───
router.get("/colegiaturas", authorize(...GESTION), finanzas.listarColegiaturas);
router.post("/colegiaturas", authorize(...GESTION), finanzas.crearColegiatura);
router.post("/colegiaturas/generar", authorize(...GESTION), finanzas.generarCargos);
router.get("/colegiaturas/:id", authorize(...GESTION), finanzas.obtenerColegiatura);
router.put("/colegiaturas/:id", authorize(...GESTION), finanzas.actualizarColegiatura);
router.delete("/colegiaturas/:id", authorize(...GESTION), finanzas.eliminarColegiatura);

// ─── Pagos ───
router.get("/pagos", authorize(...GESTION), finanzas.listarPagos);
router.post("/pagos", authorize(...GESTION), finanzas.registrarPago);
router.get("/pagos/:id", authorize(...GESTION), finanzas.obtenerPago);
router.patch("/pagos/:id/cancelar", authorize(...GESTION), finanzas.cancelarPago);

// ─── Becas ───
router.get("/becas", authorize(...GESTION), finanzas.listarBecas);
router.post("/becas", authorize(...GESTION), finanzas.crearBeca);
router.get("/becas/:id", authorize(...GESTION), finanzas.obtenerBeca);
router.put("/becas/:id", authorize(...GESTION), finanzas.actualizarBeca);
router.delete("/becas/:id", authorize(...GESTION), finanzas.eliminarBeca);

// ─── Descuentos ───
router.get("/descuentos", authorize(...GESTION), finanzas.listarDescuentos);
router.post("/descuentos", authorize(...GESTION), finanzas.crearDescuento);
router.put("/descuentos/:id", authorize(...GESTION), finanzas.actualizarDescuento);
router.delete("/descuentos/:id", authorize(...GESTION), finanzas.eliminarDescuento);

// ─── Facturas (CFDI) ───
router.get("/facturas", authorize(...GESTION), finanzas.listarFacturas);
router.post("/facturas", authorize(...GESTION), finanzas.generarFactura);
router.get("/facturas/:id", authorize(...GESTION), finanzas.obtenerFactura);
router.patch("/facturas/:id/cancelar", authorize(...GESTION), finanzas.cancelarFactura);

// ─── Reportes financieros ───
router.get("/reportes", authorize(...GESTION), finanzas.reportes);

// ─── Estado de cuenta y Pago Alumno ───
// El alumno/padre consulta el suyo; gestión consulta el de cualquier alumno.
router.get("/mi-estado-cuenta", authorize("ALUMNO", "PADRE"), finanzas.miEstadoCuenta);
router.post("/pagar-en-linea", authorize("ALUMNO", "PADRE"), finanzas.pagarEnLinea);
router.get("/estado-cuenta/:alumnoId", authorize(...GESTION), finanzas.estadoCuenta);

export default router;
