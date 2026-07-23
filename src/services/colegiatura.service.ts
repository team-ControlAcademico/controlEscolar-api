import { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { ColegiaturaInput, ColegiaturaUpdateInput, GenerarCargosInput } from "../schemas/finanzas.schema";

const prisma = new PrismaClient();

/** total = monto - descuento + recargo (nunca negativo). */
function calcularTotal(monto: number, descuento: number, recargo: number): Prisma.Decimal {
  const total = new Prisma.Decimal(monto).minus(descuento).plus(recargo);
  if (total.lessThan(0)) throw new AppError("El total no puede ser negativo", 400);
  return total;
}

export async function listarColegiaturas(params?: {
  alumnoId?: string;
  cicloEscolarId?: string;
  estatus?: string;
}) {
  const where: Prisma.ColegiaturaWhereInput = {};
  if (params?.alumnoId) where.alumnoId = params.alumnoId;
  if (params?.cicloEscolarId) where.cicloEscolarId = params.cicloEscolarId;
  if (params?.estatus) where.estatus = params.estatus;

  return prisma.colegiatura.findMany({
    where,
    include: {
      alumno: { select: { id: true, nombre: true, matricula: true } },
      cicloEscolar: { select: { id: true, nombre: true } },
      _count: { select: { pagos: true } },
    },
    orderBy: { fechaVencimiento: "asc" },
  });
}

export async function obtenerColegiatura(id: string) {
  const colegiatura = await prisma.colegiatura.findUnique({
    where: { id },
    include: {
      alumno: { select: { id: true, nombre: true, matricula: true } },
      cicloEscolar: { select: { id: true, nombre: true } },
      pagos: { orderBy: { fecha: "desc" } },
    },
  });
  if (!colegiatura) throw new AppError("Colegiatura no encontrada", 404);
  return colegiatura;
}

export async function crearColegiatura(data: ColegiaturaInput) {
  const total = calcularTotal(data.monto, data.descuento, data.recargo);
  try {
    return await prisma.colegiatura.create({
      data: {
        alumnoId: data.alumnoId,
        cicloEscolarId: data.cicloEscolarId,
        concepto: data.concepto,
        monto: new Prisma.Decimal(data.monto),
        descuento: new Prisma.Decimal(data.descuento),
        recargo: new Prisma.Decimal(data.recargo),
        total,
        fechaVencimiento: data.fechaVencimiento,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new AppError("Ya existe una colegiatura con ese concepto para el alumno en ese ciclo", 409);
    }
    throw error;
  }
}

export async function actualizarColegiatura(id: string, data: ColegiaturaUpdateInput) {
  const actual = await obtenerColegiatura(id);

  const monto = data.monto ?? actual.monto.toNumber();
  const descuento = data.descuento ?? actual.descuento.toNumber();
  const recargo = data.recargo ?? actual.recargo.toNumber();
  const total = calcularTotal(monto, descuento, recargo);

  return prisma.colegiatura.update({
    where: { id },
    data: {
      concepto: data.concepto,
      monto: new Prisma.Decimal(monto),
      descuento: new Prisma.Decimal(descuento),
      recargo: new Prisma.Decimal(recargo),
      total,
      fechaVencimiento: data.fechaVencimiento,
      estatus: data.estatus,
    },
  });
}

export async function eliminarColegiatura(id: string) {
  const colegiatura = await obtenerColegiatura(id);
  if (colegiatura.pagos.length > 0) {
    throw new AppError("No se puede eliminar una colegiatura con pagos registrados", 409);
  }
  return prisma.colegiatura.delete({ where: { id } });
}

/**
 * Genera cargos masivos de colegiatura para todos los alumnos con inscripción
 * activa en el ciclo (BACK-28). Aplica la beca vigente de mayor porcentaje de
 * cada alumno como descuento. Idempotente: usa la clave única
 * (alumno, ciclo, concepto), por lo que reejecutarlo no duplica cargos.
 */
export async function generarCargos(data: GenerarCargosInput) {
  const ciclo = await prisma.cicloEscolar.findUnique({ where: { id: data.cicloEscolarId } });
  if (!ciclo) throw new AppError("Ciclo escolar no encontrado", 404);

  // Alumnos únicos con inscripción activa en grupos de este ciclo.
  const inscripciones = await prisma.inscripcion.findMany({
    where: { estatus: "INSCRITO", grupo: { cicloEscolarId: data.cicloEscolarId } },
    select: { alumnoId: true },
    distinct: ["alumnoId"],
  });

  if (inscripciones.length === 0) {
    throw new AppError("No hay alumnos inscritos en este ciclo", 400);
  }

  const hoy = new Date();
  let creados = 0;
  let omitidos = 0;

  for (const { alumnoId } of inscripciones) {
    // Beca vigente de mayor porcentaje.
    const beca = await prisma.beca.findFirst({
      where: {
        alumnoId,
        activa: true,
        vigenciaInicio: { lte: hoy },
        vigenciaFin: { gte: hoy },
      },
      orderBy: { porcentaje: "desc" },
    });

    const monto = new Prisma.Decimal(data.monto);
    const descuento = beca
      ? monto.times(beca.porcentaje).div(100).toDecimalPlaces(2)
      : new Prisma.Decimal(0);
    const total = monto.minus(descuento);

    try {
      await prisma.colegiatura.create({
        data: {
          alumnoId,
          cicloEscolarId: data.cicloEscolarId,
          concepto: data.concepto,
          monto,
          descuento,
          recargo: new Prisma.Decimal(0),
          total,
          fechaVencimiento: data.fechaVencimiento,
        },
      });
      creados++;
    } catch (error: any) {
      if (error?.code === "P2002") {
        omitidos++; // ya existía el cargo para ese alumno/ciclo/concepto
      } else {
        throw error;
      }
    }
  }

  return { creados, omitidos, totalAlumnos: inscripciones.length };
}
