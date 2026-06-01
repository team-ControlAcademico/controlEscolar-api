import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { GrupoInput, GrupoUpdateInput, HorarioInput } from "../schemas/grupo.schema";

const prisma = new PrismaClient();

export async function listarGrupos(params?: { cicloId?: string; docenteId?: string }) {
  const where: any = {};
  if (params?.cicloId) where.cicloEscolarId = params.cicloId;
  if (params?.docenteId) where.docenteId = params.docenteId;

  return prisma.grupo.findMany({
    where,
    include: {
      materia: { select: { id: true, clave: true, nombre: true } },
      docente: { select: { id: true, nombre: true } },
      cicloEscolar: { select: { id: true, nombre: true } },
      horarios: true,
      _count: { select: { inscripciones: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function obtenerGrupo(id: string) {
  const grupo = await prisma.grupo.findUnique({
    where: { id },
    include: {
      materia: true,
      docente: { select: { id: true, nombre: true } },
      cicloEscolar: true,
      horarios: true,
      inscripciones: {
        include: {
          alumno: { select: { id: true, nombre: true, matricula: true } },
        },
      },
    },
  });
  if (!grupo) throw new AppError("Grupo no encontrado", 404);
  return grupo;
}

export async function crearGrupo(data: GrupoInput) {
  const existe = await prisma.grupo.findUnique({ where: { clave: data.clave } });
  if (existe) throw new AppError("Ya existe un grupo con esa clave", 409);
  return prisma.grupo.create({ data });
}

export async function actualizarGrupo(id: string, data: GrupoUpdateInput) {
  await obtenerGrupo(id);
  if (data.clave) {
    const existe = await prisma.grupo.findFirst({ where: { clave: data.clave, NOT: { id } } });
    if (existe) throw new AppError("Ya existe un grupo con esa clave", 409);
  }
  return prisma.grupo.update({ where: { id }, data });
}

export async function eliminarGrupo(id: string) {
  await obtenerGrupo(id);
  return prisma.grupo.delete({ where: { id } });
}

export async function agregarHorario(grupoId: string, data: HorarioInput) {
  await obtenerGrupo(grupoId);
  return prisma.horario.create({ data: { ...data, grupoId } });
}

export async function quitarHorario(horarioId: string) {
  const h = await prisma.horario.findUnique({ where: { id: horarioId } });
  if (!h) throw new AppError("Horario no encontrado", 404);
  return prisma.horario.delete({ where: { id: horarioId } });
}
