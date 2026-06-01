import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { MateriaInput, MateriaUpdateInput } from "../schemas/materia.schema";

const prisma = new PrismaClient();

export async function listarMaterias() {
  return prisma.materia.findMany({
    include: {
      prerequisitos: { include: { prerequisito: { select: { id: true, clave: true, nombre: true } } } },
      _count: { select: { grupos: true, planes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function obtenerMateria(id: string) {
  const materia = await prisma.materia.findUnique({
    where: { id },
    include: {
      prerequisitos: { include: { prerequisito: true } },
      esPrerequisitoDe: { include: { materia: true } },
      planes: { include: { plan: { include: { carrera: true } } } },
    },
  });
  if (!materia) throw new AppError("Materia no encontrada", 404);
  return materia;
}

export async function crearMateria(data: MateriaInput) {
  const existe = await prisma.materia.findUnique({ where: { clave: data.clave } });
  if (existe) throw new AppError("Ya existe una materia con esa clave", 409);
  return prisma.materia.create({ data });
}

export async function actualizarMateria(id: string, data: MateriaUpdateInput) {
  await obtenerMateria(id);
  if (data.clave) {
    const existe = await prisma.materia.findFirst({ where: { clave: data.clave, NOT: { id } } });
    if (existe) throw new AppError("Ya existe una materia con esa clave", 409);
  }
  return prisma.materia.update({ where: { id }, data });
}

export async function eliminarMateria(id: string) {
  await obtenerMateria(id);
  return prisma.materia.delete({ where: { id } });
}

export async function agregarPrerequisito(materiaId: string, prerequisitoId: string) {
  if (materiaId === prerequisitoId) throw new AppError("Una materia no puede ser prerequisito de sí misma", 400);

  const existe = await prisma.prerequisito.findUnique({
    where: { materiaId_prerequisitoId: { materiaId, prerequisitoId } },
  });
  if (existe) throw new AppError("El prerequisito ya está registrado", 409);

  return prisma.prerequisito.create({ data: { materiaId, prerequisitoId } });
}

export async function quitarPrerequisito(prerequisitoId: string) {
  const p = await prisma.prerequisito.findUnique({ where: { id: prerequisitoId } });
  if (!p) throw new AppError("Prerequisito no encontrado", 404);
  return prisma.prerequisito.delete({ where: { id: prerequisitoId } });
}
