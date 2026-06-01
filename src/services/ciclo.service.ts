import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { CicloEscolarInput, CicloEscolarUpdateInput } from "../schemas/ciclo.schema";

const prisma = new PrismaClient();

export async function listarCiclos() {
  return prisma.cicloEscolar.findMany({
    include: { _count: { select: { grupos: true } } },
    orderBy: { fechaInicio: "desc" },
  });
}

export async function obtenerCiclo(id: string) {
  const ciclo = await prisma.cicloEscolar.findUnique({
    where: { id },
    include: {
      grupos: {
        include: {
          materia: { select: { id: true, clave: true, nombre: true } },
          docente: { select: { id: true, nombre: true } },
          _count: { select: { inscripciones: true } },
        },
      },
    },
  });
  if (!ciclo) throw new AppError("Ciclo escolar no encontrado", 404);
  return ciclo;
}

export async function crearCiclo(data: CicloEscolarInput) {
  return prisma.cicloEscolar.create({
    data: {
      ...data,
      fechaInicio: new Date(data.fechaInicio),
      fechaFin: new Date(data.fechaFin),
    },
  });
}

export async function actualizarCiclo(id: string, data: CicloEscolarUpdateInput) {
  await obtenerCiclo(id);
  const updateData: any = { ...data };
  if (data.fechaInicio) updateData.fechaInicio = new Date(data.fechaInicio);
  if (data.fechaFin) updateData.fechaFin = new Date(data.fechaFin);
  return prisma.cicloEscolar.update({ where: { id }, data: updateData });
}

export async function eliminarCiclo(id: string) {
  await obtenerCiclo(id);
  return prisma.cicloEscolar.delete({ where: { id } });
}

export async function alternarActivoCiclo(id: string) {
  const ciclo = await obtenerCiclo(id);
  return prisma.cicloEscolar.update({
    where: { id },
    data: { activo: !ciclo.activo },
  });
}
