import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import type { AuthRequest } from "../middlewares/auth.middleware";
import {
  colegiaturaSchema,
  colegiaturaUpdateSchema,
  generarCargosSchema,
  pagoSchema,
  becaSchema,
  becaUpdateSchema,
  descuentoSchema,
  descuentoUpdateSchema,
  facturaSchema,
} from "../schemas/finanzas.schema";
import * as colegiaturaService from "../services/colegiatura.service";
import * as pagoService from "../services/pago.service";
import * as becaService from "../services/beca.service";
import * as descuentoService from "../services/descuento.service";
import * as facturaService from "../services/factura.service";
import * as estadoCuentaService from "../services/estadoCuenta.service";

// ─── Colegiaturas ───

export async function listarColegiaturas(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await colegiaturaService.listarColegiaturas({
      alumnoId: req.query.alumnoId as string | undefined,
      cicloEscolarId: req.query.cicloEscolarId as string | undefined,
      estatus: req.query.estatus as string | undefined,
    });
    res.json({ data });
  } catch (e) { next(e); }
}

export async function obtenerColegiatura(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await colegiaturaService.obtenerColegiatura(req.params.id);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function crearColegiatura(req: Request, res: Response, next: NextFunction) {
  try {
    const input = colegiaturaSchema.parse(req.body);
    const data = await colegiaturaService.crearColegiatura(input);
    res.status(201).json({ message: "Colegiatura creada", data });
  } catch (e) { next(e); }
}

export async function actualizarColegiatura(req: Request, res: Response, next: NextFunction) {
  try {
    const input = colegiaturaUpdateSchema.parse(req.body);
    const data = await colegiaturaService.actualizarColegiatura(req.params.id, input);
    res.json({ message: "Colegiatura actualizada", data });
  } catch (e) { next(e); }
}

export async function eliminarColegiatura(req: Request, res: Response, next: NextFunction) {
  try {
    await colegiaturaService.eliminarColegiatura(req.params.id);
    res.json({ message: "Colegiatura eliminada" });
  } catch (e) { next(e); }
}

export async function generarCargos(req: Request, res: Response, next: NextFunction) {
  try {
    const input = generarCargosSchema.parse(req.body);
    const data = await colegiaturaService.generarCargos(input);
    res.status(201).json({ message: "Cargos generados", data });
  } catch (e) { next(e); }
}

// ─── Pagos ───

export async function listarPagos(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pagoService.listarPagos({
      alumnoId: req.query.alumnoId as string | undefined,
      colegiaturaId: req.query.colegiaturaId as string | undefined,
    });
    res.json({ data });
  } catch (e) { next(e); }
}

export async function obtenerPago(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pagoService.obtenerPago(req.params.id);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function registrarPago(req: Request, res: Response, next: NextFunction) {
  try {
    const input = pagoSchema.parse(req.body);
    const data = await pagoService.registrarPago(input);
    res.status(201).json({ message: "Pago registrado", data });
  } catch (e) { next(e); }
}

export async function cancelarPago(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pagoService.cancelarPago(req.params.id);
    res.json(data);
  } catch (e) { next(e); }
}

/**
 * Webhook de pagos (BACK-30). Recibe notificaciones de un proveedor externo
 * (p. ej. Stripe) y registra el pago. La firma se valida con HMAC-SHA256 sobre
 * el cuerpo usando `STRIPE_WEBHOOK_SECRET`. Es un endpoint público: la
 * autenticidad depende exclusivamente de la firma.
 */
export async function webhookPago(req: Request, res: Response, next: NextFunction) {
  try {
    const firma = req.headers["x-webhook-signature"] as string | undefined;
    const esperado = crypto
      .createHmac("sha256", env.STRIPE_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (!firma || firma !== esperado) {
      res.status(401).json({ message: "Firma de webhook inválida" });
      return;
    }

    const input = pagoSchema.parse({ ...req.body, metodo: "STRIPE" });
    const data = await pagoService.registrarPago(input);
    res.status(201).json({ message: "Pago registrado vía webhook", data });
  } catch (e) { next(e); }
}

// ─── Becas ───

export async function listarBecas(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await becaService.listarBecas({
      alumnoId: req.query.alumnoId as string | undefined,
    });
    res.json({ data });
  } catch (e) { next(e); }
}

export async function obtenerBeca(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await becaService.obtenerBeca(req.params.id);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function crearBeca(req: Request, res: Response, next: NextFunction) {
  try {
    const input = becaSchema.parse(req.body);
    const data = await becaService.crearBeca(input);
    res.status(201).json({ message: "Beca creada", data });
  } catch (e) { next(e); }
}

export async function actualizarBeca(req: Request, res: Response, next: NextFunction) {
  try {
    const input = becaUpdateSchema.parse(req.body);
    const data = await becaService.actualizarBeca(req.params.id, input);
    res.json({ message: "Beca actualizada", data });
  } catch (e) { next(e); }
}

export async function eliminarBeca(req: Request, res: Response, next: NextFunction) {
  try {
    await becaService.eliminarBeca(req.params.id);
    res.json({ message: "Beca eliminada" });
  } catch (e) { next(e); }
}

// ─── Descuentos ───

export async function listarDescuentos(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await descuentoService.listarDescuentos();
    res.json({ data });
  } catch (e) { next(e); }
}

export async function crearDescuento(req: Request, res: Response, next: NextFunction) {
  try {
    const input = descuentoSchema.parse(req.body);
    const data = await descuentoService.crearDescuento(input);
    res.status(201).json({ message: "Descuento creado", data });
  } catch (e) { next(e); }
}

export async function actualizarDescuento(req: Request, res: Response, next: NextFunction) {
  try {
    const input = descuentoUpdateSchema.parse(req.body);
    const data = await descuentoService.actualizarDescuento(req.params.id, input);
    res.json({ message: "Descuento actualizado", data });
  } catch (e) { next(e); }
}

export async function eliminarDescuento(req: Request, res: Response, next: NextFunction) {
  try {
    await descuentoService.eliminarDescuento(req.params.id);
    res.json({ message: "Descuento eliminado" });
  } catch (e) { next(e); }
}

// ─── Facturas (CFDI) ───

export async function listarFacturas(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await facturaService.listarFacturas({
      estatus: req.query.estatus as string | undefined,
    });
    res.json({ data });
  } catch (e) { next(e); }
}

export async function obtenerFactura(req: Request, res: Response, next: NextFunction) {
  try {
    const incluirXml = req.query.xml === "true";
    const data = await facturaService.obtenerFactura(req.params.id, incluirXml);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function generarFactura(req: Request, res: Response, next: NextFunction) {
  try {
    const input = facturaSchema.parse(req.body);
    const data = await facturaService.generarFactura(input);
    res.status(201).json({ message: "Factura timbrada", data });
  } catch (e) { next(e); }
}

export async function cancelarFactura(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await facturaService.cancelarFactura(req.params.id);
    res.json({ message: "Factura cancelada", data });
  } catch (e) { next(e); }
}

// ─── Estado de cuenta y reportes ───

export async function estadoCuenta(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await estadoCuentaService.obtenerEstadoCuenta(req.params.alumnoId);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function miEstadoCuenta(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autenticado" });
      return;
    }
    const data = await estadoCuentaService.obtenerMiEstadoCuenta(req.user.userId);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function reportes(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await estadoCuentaService.reporteFinanciero(req.query.cicloEscolarId as string | undefined);
    res.json({ data });
  } catch (e) { next(e); }
}

export async function pagarEnLinea(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user || (req.user.role !== "ALUMNO" && req.user.role !== "PADRE")) {
      res.status(403).json({ message: "Acceso denegado: solo alumnos/padres pueden usar este endpoint simulado" });
      return;
    }
    const { colegiaturaId, monto } = req.body;
    if (!colegiaturaId || !monto) {
      res.status(400).json({ message: "Se requiere colegiaturaId y monto" });
      return;
    }
    // Llama al servicio de registrarPago simulando método STRIPE
    const data = await pagoService.registrarPago({
      colegiaturaId,
      monto,
      metodo: "STRIPE",
      referencia: "pago_simulado_en_linea_" + Date.now(),
    });
    res.status(201).json({ message: "Pago en línea (simulado) exitoso", data });
  } catch (e) { next(e); }
}
