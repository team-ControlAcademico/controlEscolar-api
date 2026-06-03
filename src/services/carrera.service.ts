import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { CarreraInput, CarreraUpdateInput } from "../schemas/carrera.schema";

const prisma = new PrismaClient();

export async function listarCarreras() {
  return prisma.carrera.findMany({
    include: { _count: { select: { alumnos: true, planes: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function obtenerCarrera(id: string) {
  const carrera = await prisma.carrera.findUnique({
    where: { id },
    include: {
      planes: true,
      _count: { select: { alumnos: true } },
    },
  });
  if (!carrera) throw new AppError("Carrera no encontrada", 404);
  return carrera;
}

export async function crearCarrera(data: CarreraInput) {
  const existe = await prisma.carrera.findUnique({ where: { clave: data.clave } });
  if (existe) throw new AppError("Ya existe una carrera con esa clave", 409);
  return prisma.carrera.create({ data });
}

export async function actualizarCarrera(id: string, data: CarreraUpdateInput) {
  await obtenerCarrera(id);
  if (data.clave) {
    const existe = await prisma.carrera.findFirst({ where: { clave: data.clave, NOT: { id } } });
    if (existe) throw new AppError("Ya existe una carrera con esa clave", 409);
  }
  return prisma.carrera.update({ where: { id }, data });
}

export async function eliminarCarrera(id: string) {
  await obtenerCarrera(id);
  return prisma.carrera.delete({ where: { id } });
}
