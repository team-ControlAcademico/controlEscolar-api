import crypto from "crypto";
import { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import { env } from "../config/env";
import { encrypt, decrypt } from "../utils/crypto";
import type { FacturaInput } from "../schemas/finanzas.schema";

const prisma = new PrismaClient();

const RFC_EMISOR = "UNI010101AAA"; // RFC de la institución (demo)

/**
 * Punto de integración con el PAC / SAT (BACK-32, BACK-33).
 *
 * En producción este método enviaría el comprobante a un Proveedor Autorizado
 * de Certificación (PAC) para su timbrado y devolvería el UUID (folio fiscal),
 * la cadena original del complemento y el sello digital reales. En desarrollo
 * generamos valores simulados de forma determinista para poder ejercitar todo
 * el flujo sin credenciales del SAT. Igual que `email.service`, aquí es donde
 * se conecta el proveedor real.
 */
function timbrarConPAC(input: {
  serie: string;
  folio: number;
  rfcReceptor: string;
  total: Prisma.Decimal;
}) {
  const cfdiUuid = crypto.randomUUID().toUpperCase();
  const cadenaOriginal =
    `||4.0|${input.serie}|${input.folio}|${RFC_EMISOR}|${input.rfcReceptor}|` +
    `${input.total.toFixed(2)}|MXN|PUE|${cfdiUuid}||`;
  const selloDigital = crypto
    .createHmac("sha256", env.FINANZAS_ENCRYPTION_KEY)
    .update(cadenaOriginal)
    .digest("base64");
  const xml =
    `<cfdi:Comprobante Version="4.0" Serie="${input.serie}" Folio="${input.folio}" ` +
    `Total="${input.total.toFixed(2)}" Moneda="MXN">` +
    `<cfdi:Complemento><tfd:TimbreFiscalDigital UUID="${cfdiUuid}" ` +
    `SelloCFD="${selloDigital}"/></cfdi:Complemento></cfdi:Comprobante>`;

  return { cfdiUuid, cadenaOriginal, selloDigital, xml };
}

export async function listarFacturas(params?: { estatus?: string }) {
  const where: Prisma.FacturaWhereInput = {};
  if (params?.estatus) where.estatus = params.estatus;

  return prisma.factura.findMany({
    where,
    include: {
      pago: {
        select: {
          id: true,
          monto: true,
          fecha: true,
          alumno: { select: { id: true, nombre: true, matricula: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function obtenerFactura(id: string, incluirXml = false) {
  const factura = await prisma.factura.findUnique({
    where: { id },
    include: {
      pago: {
        include: {
          alumno: { select: { id: true, nombre: true, matricula: true } },
          colegiatura: { select: { id: true, concepto: true } },
        },
      },
    },
  });
  if (!factura) throw new AppError("Factura no encontrada", 404);

  // El XML se guarda cifrado; solo se descifra bajo petición explícita.
  const { xmlData, ...rest } = factura;
  return {
    ...rest,
    xmlData: incluirXml && xmlData ? decrypt(xmlData) : undefined,
  };
}

/** Emite (timbra) un CFDI 4.0 a partir de un pago confirmado. */
export async function generarFactura(data: FacturaInput) {
  const pago = await prisma.pago.findUnique({
    where: { id: data.pagoId },
    include: { factura: true },
  });
  if (!pago) throw new AppError("Pago no encontrado", 404);
  if (pago.estatus !== "CONFIRMADO") throw new AppError("Solo se factura un pago confirmado", 400);
  if (pago.factura) throw new AppError("El pago ya tiene factura", 409);

  // El pago es el total (IVA incluido). Se desglosa: subtotal = total / (1+IVA).
  const total = pago.monto;
  const subtotal = total.div(1 + env.IVA_RATE).toDecimalPlaces(2);
  const iva = total.minus(subtotal);

  const folio = (await prisma.factura.count()) + 1;
  const serie = "A";
  const timbre = timbrarConPAC({ serie, folio, rfcReceptor: data.rfcReceptor, total });

  return prisma.factura.create({
    data: {
      pagoId: pago.id,
      cfdiUuid: timbre.cfdiUuid,
      serie,
      folio,
      rfcReceptor: data.rfcReceptor.toUpperCase(),
      razonSocial: data.razonSocial,
      usoCfdi: data.usoCfdi,
      subtotal,
      iva,
      total,
      xmlData: encrypt(timbre.xml),
      cadenaOriginal: timbre.cadenaOriginal,
      selloDigital: timbre.selloDigital,
      estatus: "TIMBRADA",
    },
  });
}

/** Cancela un CFDI ante el SAT (aquí simulado). */
export async function cancelarFactura(id: string) {
  const factura = await prisma.factura.findUnique({ where: { id } });
  if (!factura) throw new AppError("Factura no encontrada", 404);
  if (factura.estatus === "CANCELADA") throw new AppError("La factura ya está cancelada", 400);

  return prisma.factura.update({ where: { id }, data: { estatus: "CANCELADA" } });
}
