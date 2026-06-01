import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { PlanEstudioInput, PlanEstudioUpdateInput } from "../schemas/plan.schema";

const prisma = new PrismaClient();

export async function listarPlanes() {
  return prisma.planEstudio.findMany({
    include: {
      carrera: { select: { id: true, clave: true, nombre: true } },
      _count: { select: { materias: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function obtenerPlan(id: string) {
  const plan = await prisma.planEstudio.findUnique({
    where: { id },
    include: {
      carrera: true,
      materias: {
        include: { materia: true },
        orderBy: { semestre: "asc" },
      },
    },
  });
  if (!plan) throw new AppError("Plan de estudio no encontrado", 404);
  return plan;
}

export async function crearPlan(data: PlanEstudioInput) {
  const existe = await prisma.planEstudio.findUnique({ where: { clave: data.clave } });
  if (existe) throw new AppError("Ya existe un plan con esa clave", 409);
  return prisma.planEstudio.create({ data });
}

export async function actualizarPlan(id: string, data: PlanEstudioUpdateInput) {
  await obtenerPlan(id);
  if (data.clave) {
    const existe = await prisma.planEstudio.findFirst({ where: { clave: data.clave, NOT: { id } } });
    if (existe) throw new AppError("Ya existe un plan con esa clave", 409);
  }
  return prisma.planEstudio.update({ where: { id }, data });
}

export async function eliminarPlan(id: string) {
  await obtenerPlan(id);
  return prisma.planEstudio.delete({ where: { id } });
}

export async function agregarMateriaPlan(planId: string, materiaId: string, semestre: number) {
  await obtenerPlan(planId);
  const duplicada = await prisma.planMateria.findUnique({
    where: { planId_materiaId: { planId, materiaId } },
  });
  if (duplicada) throw new AppError("La materia ya está en este plan", 409);

  return prisma.planMateria.create({
    data: { planId, materiaId, semestre },
  });
}

export async function quitarMateriaPlan(planMateriaId: string) {
  const pm = await prisma.planMateria.findUnique({ where: { id: planMateriaId } });
  if (!pm) throw new AppError("La materia no está en este plan", 404);
  return prisma.planMateria.delete({ where: { id: planMateriaId } });
}
