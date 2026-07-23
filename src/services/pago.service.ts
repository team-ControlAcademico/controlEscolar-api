import { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { PagoInput } from "../schemas/finanzas.schema";

const prisma = new PrismaClient();

/** Suma de pagos confirmados de una colegiatura. */
function totalPagado(pagos: { monto: Prisma.Decimal; estatus: string }[]): Prisma.Decimal {
  return pagos
    .filter((p) => p.estatus === "CONFIRMADO")
    .reduce((acc, p) => acc.plus(p.monto), new Prisma.Decimal(0));
}

function estatusPorSaldo(total: Prisma.Decimal, pagado: Prisma.Decimal): string {
  if (pagado.greaterThanOrEqualTo(total)) return "PAGADA";
  if (pagado.greaterThan(0)) return "PARCIAL";
  return "PENDIENTE";
}

export async function listarPagos(params?: { alumnoId?: string; colegiaturaId?: string }) {
  const where: Prisma.PagoWhereInput = {};
  if (params?.alumnoId) where.alumnoId = params.alumnoId;
  if (params?.colegiaturaId) where.colegiaturaId = params.colegiaturaId;

  return prisma.pago.findMany({
    where,
    include: {
      alumno: { select: { id: true, nombre: true, matricula: true } },
      colegiatura: { select: { id: true, concepto: true, total: true } },
      factura: { select: { id: true, cfdiUuid: true, estatus: true } },
    },
    orderBy: { fecha: "desc" },
  });
}

export async function obtenerPago(id: string) {
  const pago = await prisma.pago.findUnique({
    where: { id },
    include: {
      alumno: { select: { id: true, nombre: true, matricula: true } },
      colegiatura: true,
      factura: true,
    },
  });
  if (!pago) throw new AppError("Pago no encontrado", 404);
  return pago;
}

/**
 * Registra un pago contra una colegiatura de forma atómica (BACK-29, BACK-15).
 * La validación de saldo y la actualización del estatus de la colegiatura se
 * ejecutan en una transacción `Serializable` para impedir sobrepagos cuando
 * dos pagos concurrentes intentan liquidar el mismo saldo restante.
 */
export async function registrarPago(data: PagoInput) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const colegiatura = await tx.colegiatura.findUnique({
          where: { id: data.colegiaturaId },
          include: { pagos: true },
        });
        if (!colegiatura) throw new AppError("Colegiatura no encontrada", 404);
        if (colegiatura.estatus === "CANCELADA") {
          throw new AppError("La colegiatura está cancelada", 400);
        }

        const pagado = totalPagado(colegiatura.pagos);
        const saldo = colegiatura.total.minus(pagado);
        const montoPago = new Prisma.Decimal(data.monto);

        if (saldo.lessThanOrEqualTo(0)) {
          throw new AppError("La colegiatura ya está pagada", 400);
        }
        if (montoPago.greaterThan(saldo)) {
          throw new AppError(`El monto excede el saldo pendiente (${saldo.toFixed(2)})`, 400);
        }

        const pago = await tx.pago.create({
          data: {
            colegiaturaId: colegiatura.id,
            alumnoId: colegiatura.alumnoId,
            monto: montoPago,
            metodo: data.metodo,
            referencia: data.referencia || null,
          },
        });

        const nuevoEstatus = estatusPorSaldo(colegiatura.total, pagado.plus(montoPago));
        await tx.colegiatura.update({
          where: { id: colegiatura.id },
          data: { estatus: nuevoEstatus },
        });

        return pago;
      },
      { isolationLevel: "Serializable" }
    );
  } catch (error: any) {
    if (error?.code === "P2034") {
      throw new AppError("Conflicto de concurrencia al registrar el pago, reintenta", 409);
    }
    throw error;
  }
}

/** Cancela un pago y recalcula el estatus de la colegiatura. */
export async function cancelarPago(id: string) {
  return prisma.$transaction(async (tx) => {
    const pago = await tx.pago.findUnique({
      where: { id },
      include: { colegiatura: { include: { pagos: true } } },
    });
    if (!pago) throw new AppError("Pago no encontrado", 404);
    if (pago.estatus === "CANCELADO") throw new AppError("El pago ya está cancelado", 400);

    await tx.pago.update({ where: { id }, data: { estatus: "CANCELADO" } });

    const restantes = pago.colegiatura.pagos.map((p) =>
      p.id === id ? { ...p, estatus: "CANCELADO" } : p
    );
    const pagado = totalPagado(restantes);
    await tx.colegiatura.update({
      where: { id: pago.colegiaturaId },
      data: { estatus: estatusPorSaldo(pago.colegiatura.total, pagado) },
    });

    return { message: "Pago cancelado" };
  });
}
