import { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

function pagadoDe(pagos: { monto: Prisma.Decimal; estatus: string }[]): Prisma.Decimal {
  return pagos
    .filter((p) => p.estatus === "CONFIRMADO")
    .reduce((acc, p) => acc.plus(p.monto), new Prisma.Decimal(0));
}

/**
 * Estado de cuenta de un alumno: cada colegiatura con su saldo derivado, más
 * los totales cargado/pagado/saldo y las becas vigentes.
 */
export async function obtenerEstadoCuenta(alumnoId: string) {
  const alumno = await prisma.alumnoProfile.findUnique({
    where: { id: alumnoId },
    select: { id: true, nombre: true, matricula: true, semestre: true },
  });
  if (!alumno) throw new AppError("Alumno no encontrado", 404);

  const colegiaturas = await prisma.colegiatura.findMany({
    where: { alumnoId },
    include: {
      cicloEscolar: { select: { id: true, nombre: true } },
      pagos: { orderBy: { fecha: "desc" } },
    },
    orderBy: { fechaVencimiento: "asc" },
  });

  const hoy = new Date();
  let totalCargado = new Prisma.Decimal(0);
  let totalPagado = new Prisma.Decimal(0);

  const movimientos = colegiaturas.map((c) => {
    const pagado = pagadoDe(c.pagos);
    const saldo = c.total.minus(pagado);
    const vencida = c.estatus !== "PAGADA" && c.estatus !== "CANCELADA" && c.fechaVencimiento < hoy && saldo.greaterThan(0);

    if (c.estatus !== "CANCELADA") {
      totalCargado = totalCargado.plus(c.total);
      totalPagado = totalPagado.plus(pagado);
    }

    return {
      id: c.id,
      concepto: c.concepto,
      cicloEscolar: c.cicloEscolar,
      monto: c.monto.toFixed(2),
      descuento: c.descuento.toFixed(2),
      recargo: c.recargo.toFixed(2),
      total: c.total.toFixed(2),
      pagado: pagado.toFixed(2),
      saldo: saldo.toFixed(2),
      fechaVencimiento: c.fechaVencimiento,
      estatus: vencida ? "VENCIDA" : c.estatus,
      pagos: c.pagos.map((p) => ({
        id: p.id,
        monto: p.monto.toFixed(2),
        fecha: p.fecha,
        metodo: p.metodo,
        estatus: p.estatus,
      })),
    };
  });

  const becas = await prisma.beca.findMany({
    where: { alumnoId, activa: true },
    orderBy: { vigenciaFin: "desc" },
  });

  return {
    alumno,
    resumen: {
      totalCargado: totalCargado.toFixed(2),
      totalPagado: totalPagado.toFixed(2),
      saldoTotal: totalCargado.minus(totalPagado).toFixed(2),
    },
    movimientos,
    becas: becas.map((b) => ({
      id: b.id,
      tipo: b.tipo,
      porcentaje: b.porcentaje.toFixed(2),
      vigenciaInicio: b.vigenciaInicio,
      vigenciaFin: b.vigenciaFin,
    })),
  };
}

/** Estado de cuenta del alumno autenticado (portal ALUMNO) o del hijo vinculado (portal PADRE). */
export async function obtenerMiEstadoCuenta(userId: string) {
  // Primero intentar como alumno
  const alumno = await prisma.alumnoProfile.findUnique({ where: { userId }, select: { id: true } });
  if (alumno) return obtenerEstadoCuenta(alumno.id);

  // Si no es alumno, intentar como padre (buscar al hijo vinculado)
  const padre = await prisma.padreProfile.findUnique({ where: { userId }, select: { alumnoId: true } });
  if (padre && padre.alumnoId) return obtenerEstadoCuenta(padre.alumnoId);

  throw new AppError("No se encontró un perfil de alumno o padre vinculado", 404);
}

/**
 * Reporte financiero directivo: ingresos, cartera total y cartera vencida.
 * Filtrable por ciclo escolar. (BACK-29 / reportes de Fase 4).
 */
export async function reporteFinanciero(cicloEscolarId?: string) {
  const whereColeg: Prisma.ColegiaturaWhereInput = { estatus: { not: "CANCELADA" } };
  if (cicloEscolarId) whereColeg.cicloEscolarId = cicloEscolarId;

  const colegiaturas = await prisma.colegiatura.findMany({
    where: whereColeg,
    include: {
      pagos: true,
      cicloEscolar: { select: { id: true, nombre: true } },
      alumno: { select: { id: true, nombre: true, matricula: true } },
    },
  });

  const hoy = new Date();
  let totalIngresos = new Prisma.Decimal(0);
  let totalCartera = new Prisma.Decimal(0);
  let carteraVencida = new Prisma.Decimal(0);
  const alumnosConAdeudo = new Set<string>();
  const porCiclo: Record<string, { ciclo: string; ingresos: Prisma.Decimal; cartera: Prisma.Decimal }> = {};

  for (const c of colegiaturas) {
    const pagado = pagadoDe(c.pagos);
    const saldo = c.total.minus(pagado);
    totalIngresos = totalIngresos.plus(pagado);

    const key = c.cicloEscolarId;
    if (!porCiclo[key]) porCiclo[key] = { ciclo: c.cicloEscolar.nombre, ingresos: new Prisma.Decimal(0), cartera: new Prisma.Decimal(0) };
    porCiclo[key].ingresos = porCiclo[key].ingresos.plus(pagado);

    if (saldo.greaterThan(0)) {
      totalCartera = totalCartera.plus(saldo);
      porCiclo[key].cartera = porCiclo[key].cartera.plus(saldo);
      alumnosConAdeudo.add(c.alumnoId);
      if (c.fechaVencimiento < hoy) carteraVencida = carteraVencida.plus(saldo);
    }
  }

  return {
    resumen: {
      totalIngresos: totalIngresos.toFixed(2),
      totalCartera: totalCartera.toFixed(2),
      carteraVencida: carteraVencida.toFixed(2),
      alumnosConAdeudo: alumnosConAdeudo.size,
    },
    porCiclo: Object.entries(porCiclo).map(([id, v]) => ({
      cicloEscolarId: id,
      ciclo: v.ciclo,
      ingresos: v.ingresos.toFixed(2),
      cartera: v.cartera.toFixed(2),
    })),
  };
}
