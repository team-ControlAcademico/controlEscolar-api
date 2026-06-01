import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { InscribirInput } from "../schemas/inscripcion.schema";

const prisma = new PrismaClient();

export async function listarInscripciones(params?: { grupoId?: string; alumnoId?: string }) {
  const where: any = {};
  if (params?.grupoId) where.grupoId = params.grupoId;
  if (params?.alumnoId) where.alumnoId = params.alumnoId;

  return prisma.inscripcion.findMany({
    where,
    include: {
      alumno: { select: { id: true, nombre: true, matricula: true } },
      grupo: {
        include: {
          materia: { select: { id: true, clave: true, nombre: true } },
          docente: { select: { id: true, nombre: true } },
          cicloEscolar: { select: { id: true, nombre: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function obtenerInscripcion(id: string) {
  const insc = await prisma.inscripcion.findUnique({
    where: { id },
    include: {
      alumno: { select: { id: true, nombre: true, matricula: true, semestre: true, estatus: true } },
      grupo: {
        include: {
          materia: true,
          docente: { select: { id: true, nombre: true } },
          cicloEscolar: true,
          horarios: true,
        },
      },
    },
  });
  if (!insc) throw new AppError("Inscripción no encontrada", 404);
  return insc;
}

export async function inscribirAlumno(data: InscribirInput) {
  const existe = await prisma.inscripcion.findUnique({
    where: { alumnoId_grupoId: { alumnoId: data.alumnoId, grupoId: data.grupoId } },
  });
  if (existe) throw new AppError("El alumno ya está inscrito en este grupo", 409);

  const grupo = await prisma.grupo.findUnique({
    where: { id: data.grupoId },
    include: { _count: { select: { inscripciones: true } } },
  });
  if (!grupo) throw new AppError("Grupo no encontrado", 404);
  if (grupo._count.inscripciones >= grupo.cupoMaximo) {
    throw new AppError("El grupo ha alcanzado el cupo máximo", 400);
  }

  return prisma.inscripcion.create({ data });
}

export async function cambiarEstatusInscripcion(id: string, estatus: string) {
  await obtenerInscripcion(id);
  return prisma.inscripcion.update({ where: { id }, data: { estatus } });
}

export async function eliminarInscripcion(id: string) {
  await obtenerInscripcion(id);
  return prisma.inscripcion.delete({ where: { id } });
}
