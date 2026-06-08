import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { RegistrarCalificacionesBatchInput } from "../schemas/calificacion.schema";

const prisma = new PrismaClient();

export async function registrarCalificacionesBatch(grupoId: string, input: RegistrarCalificacionesBatchInput) {
  const grupo = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: { inscripciones: { select: { alumnoId: true } } },
  });
  if (!grupo) throw new AppError("Grupo no encontrado", 404);

  // Validar que todos los alumnoId pertenecen al grupo
  const alumnosInscritos = new Set(grupo.inscripciones.map((i) => i.alumnoId));
  for (const r of input.registros) {
    if (!alumnosInscritos.has(r.alumnoId)) {
      throw new AppError(`Alumno ${r.alumnoId} no está inscrito en este grupo`, 400);
    }
  }

  // Upsert masivo de calificaciones
  const results = await prisma.$transaction(
    input.registros.map((r) =>
      prisma.calificacion.upsert({
        where: {
          alumnoId_grupoId_unidad_tipo: {
            alumnoId: r.alumnoId,
            grupoId,
            unidad: input.unidad,
            tipo: input.tipo,
          },
        },
        update: {
          calificacion: r.calificacion,
        },
        create: {
          alumnoId: r.alumnoId,
          grupoId,
          unidad: input.unidad,
          tipo: input.tipo,
          calificacion: r.calificacion,
        },
      })
    )
  );

  return results;
}

export async function obtenerCalificacionesPorGrupo(grupoId: string) {
  const grupo = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: {
      materia: { select: { id: true, clave: true, nombre: true } },
      inscripciones: {
        where: { estatus: "INSCRITO" },
        include: {
          alumno: { select: { id: true, nombre: true, matricula: true } },
        },
      },
    },
  });
  if (!grupo) throw new AppError("Grupo no encontrado", 404);

  const calificaciones = await prisma.calificacion.findMany({
    where: { grupoId },
    orderBy: [{ unidad: "asc" }, { tipo: "asc" }],
  });

  // Agrupar por alumno
  const alumnos = grupo.inscripciones.map((insc) => {
    const calAlumno = calificaciones.filter((c) => c.alumnoId === insc.alumnoId);
    const unidades: Record<number, { calificacion: number; tipo: string }[]> = {};

    for (const c of calAlumno) {
      if (!unidades[c.unidad]) unidades[c.unidad] = [];
      unidades[c.unidad].push({ calificacion: c.calificacion, tipo: c.tipo });
    }

    // Calcular promedio solo de calificaciones ORDINARIO
    const calsOrdinarias = calAlumno.filter((c) => c.tipo === "ORDINARIO");
    const promedio = calsOrdinarias.length > 0
      ? Math.round((calsOrdinarias.reduce((sum, c) => sum + c.calificacion, 0) / calsOrdinarias.length) * 10) / 10
      : null;

    return {
      alumnoId: insc.alumnoId,
      nombre: insc.alumno.nombre,
      matricula: insc.alumno.matricula,
      unidades,
      promedio,
    };
  });

  return { grupo: { id: grupo.id, clave: grupo.clave, materia: grupo.materia }, alumnos };
}

export async function obtenerBoletaAlumno(alumnoId: string, cicloEscolarId?: string) {
  const alumno = await prisma.alumnoProfile.findUnique({
    where: { id: alumnoId },
    select: { id: true, nombre: true, matricula: true, semestre: true },
  });
  if (!alumno) throw new AppError("Alumno no encontrado", 404);

  const whereInscripcion: any = { alumnoId, estatus: "INSCRITO" };

  const inscripciones = await prisma.inscripcion.findMany({
    where: whereInscripcion,
    include: {
      grupo: {
        include: {
          materia: { select: { id: true, clave: true, nombre: true, creditos: true } },
          docente: { select: { id: true, nombre: true } },
          cicloEscolar: { select: { id: true, nombre: true } },
        },
      },
    },
  });

  // Filtrar por ciclo si se proporciona
  const inscripcionesFiltradas = cicloEscolarId
    ? inscripciones.filter((i) => i.grupo.cicloEscolarId === cicloEscolarId)
    : inscripciones;

  const boleta = await Promise.all(
    inscripcionesFiltradas.map(async (insc) => {
      const calificaciones = await prisma.calificacion.findMany({
        where: { alumnoId, grupoId: insc.grupoId },
        orderBy: [{ unidad: "asc" }, { tipo: "asc" }],
      });

      const unidades: Record<number, { calificacion: number; tipo: string }[]> = {};
      for (const c of calificaciones) {
        if (!unidades[c.unidad]) unidades[c.unidad] = [];
        unidades[c.unidad].push({ calificacion: c.calificacion, tipo: c.tipo });
      }

      const calsOrdinarias = calificaciones.filter((c) => c.tipo === "ORDINARIO");
      const promedio = calsOrdinarias.length > 0
        ? Math.round((calsOrdinarias.reduce((sum, c) => sum + c.calificacion, 0) / calsOrdinarias.length) * 10) / 10
        : null;

      return {
        grupoId: insc.grupoId,
        grupoClave: insc.grupo.clave,
        materia: insc.grupo.materia,
        docente: insc.grupo.docente,
        cicloEscolar: insc.grupo.cicloEscolar,
        unidades,
        promedio,
      };
    })
  );

  return { alumno, boleta };
}

export async function obtenerMisCalificaciones(userId: string) {
  const alumno = await prisma.alumnoProfile.findUnique({
    where: { userId },
    select: { id: true, nombre: true, matricula: true, semestre: true },
  });
  if (!alumno) throw new AppError("Perfil de alumno no encontrado", 404);

  return obtenerBoletaAlumno(alumno.id);
}
