import { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { BecaInput, BecaUpdateInput } from "../schemas/finanzas.schema";

const prisma = new PrismaClient();

export async function listarBecas(params?: { alumnoId?: string; activa?: boolean }) {
  const where: Prisma.BecaWhereInput = {};
  if (params?.alumnoId) where.alumnoId = params.alumnoId;
  if (params?.activa !== undefined) where.activa = params.activa;

  return prisma.beca.findMany({
    where,
    include: { alumno: { select: { id: true, nombre: true, matricula: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function obtenerBeca(id: string) {
  const beca = await prisma.beca.findUnique({
    where: { id },
    include: { alumno: { select: { id: true, nombre: true, matricula: true } } },
  });
  if (!beca) throw new AppError("Beca no encontrada", 404);
  return beca;
}

export async function crearBeca(data: BecaInput) {
  if (data.vigenciaFin < data.vigenciaInicio) {
    throw new AppError("La vigencia final no puede ser anterior a la inicial", 400);
  }
  const alumno = await prisma.alumnoProfile.findUnique({ where: { id: data.alumnoId } });
  if (!alumno) throw new AppError("Alumno no encontrado", 404);

  return prisma.beca.create({
    data: {
      alumnoId: data.alumnoId,
      tipo: data.tipo,
      porcentaje: new Prisma.Decimal(data.porcentaje),
      descripcion: data.descripcion || null,
      vigenciaInicio: data.vigenciaInicio,
      vigenciaFin: data.vigenciaFin,
    },
  });
}

export async function actualizarBeca(id: string, data: BecaUpdateInput) {
  await obtenerBeca(id);
  return prisma.beca.update({
    where: { id },
    data: {
      tipo: data.tipo,
      porcentaje: data.porcentaje !== undefined ? new Prisma.Decimal(data.porcentaje) : undefined,
      descripcion: data.descripcion,
      vigenciaInicio: data.vigenciaInicio,
      vigenciaFin: data.vigenciaFin,
      activa: data.activa,
    },
  });
}

export async function eliminarBeca(id: string) {
  await obtenerBeca(id);
  return prisma.beca.delete({ where: { id } });
}
