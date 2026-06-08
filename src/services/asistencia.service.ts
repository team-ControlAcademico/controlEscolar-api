import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { RegistrarAsistenciaBatchInput } from "../schemas/asistencia.schema";

const prisma = new PrismaClient();

export async function registrarAsistenciaBatch(grupoId: string, input: RegistrarAsistenciaBatchInput) {
  // Validar que el grupo existe
  const grupo = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: { inscripciones: { select: { alumnoId: true } } },
  });
  if (!grupo) throw new AppError("Grupo no encontrado", 404);

  const fecha = new Date(input.fecha);

  // Validar que todos los alumnoId pertenecen al grupo
  const alumnosInscritos = new Set(grupo.inscripciones.map((i) => i.alumnoId));
  for (const r of input.registros) {
    if (!alumnosInscritos.has(r.alumnoId)) {
      throw new AppError(`Alumno ${r.alumnoId} no está inscrito en este grupo`, 400);
    }
  }

  // Upsert masivo de asistencias
  const results = await prisma.$transaction(
    input.registros.map((r) =>
      prisma.asistencia.upsert({
        where: {
          alumnoId_grupoId_fecha: {
            alumnoId: r.alumnoId,
            grupoId,
            fecha,
          },
        },
        update: {
          presente: r.presente,
          justificacion: r.justificacion || null,
        },
        create: {
          alumnoId: r.alumnoId,
          grupoId,
          fecha,
          presente: r.presente,
          justificacion: r.justificacion || null,
        },
      })
    )
  );

  return results;
}

export async function obtenerAsistenciaPorGrupo(grupoId: string, fecha?: string) {
  const grupo = await prisma.grupo.findUnique({ where: { id: grupoId } });
  if (!grupo) throw new AppError("Grupo no encontrado", 404);

  const where: any = { grupoId };
  if (fecha) {
    where.fecha = new Date(fecha);
  }

  return prisma.asistencia.findMany({
    where,
    include: {
      alumno: { select: { id: true, nombre: true, matricula: true } },
    },
    orderBy: [{ fecha: "desc" }, { alumno: { nombre: "asc" } }],
  });
}

export async function obtenerAsistenciaPorAlumno(alumnoId: string, grupoId?: string) {
  const where: any = { alumnoId };
  if (grupoId) where.grupoId = grupoId;

  return prisma.asistencia.findMany({
    where,
    include: {
      grupo: {
        include: {
          materia: { select: { id: true, clave: true, nombre: true } },
        },
      },
    },
    orderBy: { fecha: "desc" },
  });
}

export async function obtenerEstadisticas(grupoId: string) {
  const grupo = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: {
      inscripciones: {
        where: { estatus: "INSCRITO" },
        include: {
          alumno: { select: { id: true, nombre: true, matricula: true } },
        },
      },
    },
  });
  if (!grupo) throw new AppError("Grupo no encontrado", 404);

  const estadisticas = await Promise.all(
    grupo.inscripciones.map(async (insc) => {
      const total = await prisma.asistencia.count({
        where: { alumnoId: insc.alumnoId, grupoId },
      });
      const presentes = await prisma.asistencia.count({
        where: { alumnoId: insc.alumnoId, grupoId, presente: true },
      });

      const porcentaje = total > 0 ? Math.round((presentes / total) * 100 * 10) / 10 : 100;

      return {
        alumnoId: insc.alumnoId,
        nombre: insc.alumno.nombre,
        matricula: insc.alumno.matricula,
        total,
        presentes,
        porcentaje,
        enRiesgo: porcentaje < 80,
      };
    })
  );

  return estadisticas;
}

export async function obtenerFechasConAsistencia(grupoId: string) {
  const fechas = await prisma.asistencia.findMany({
    where: { grupoId },
    select: { fecha: true },
    distinct: ["fecha"],
    orderBy: { fecha: "desc" },
  });

  return fechas.map((f) => f.fecha);
}
