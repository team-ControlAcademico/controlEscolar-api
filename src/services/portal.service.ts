import { PrismaClient } from "@prisma/client";
import { obtenerBoletaAlumno } from "./calificacion.service";

const prisma = new PrismaClient();

// Helpers para obtener el nombre de un perfil
function getProfileName(user: any): string {
  return (
    user.admin?.nombre ??
    user.escolar?.nombre ??
    user.administrativo?.nombre ??
    user.docente?.nombre ??
    user.alumno?.nombre ??
    user.padre?.nombre ??
    user.email
  );
}

/**
 * Portal BFF — Alumno: consolida datos en una sola respuesta.
 */
export async function portalAlumno(userId: string) {
  // Obtener perfil de alumno
  const alumno = await prisma.alumnoProfile.findUnique({
    where: { userId },
    include: {
      carrera: { select: { id: true, clave: true, nombre: true } },
    },
  });
  if (!alumno) throw Object.assign(new Error("Perfil de alumno no encontrado"), { statusCode: 404 });

  // Ciclo activo
  const cicloActivo = await prisma.cicloEscolar.findFirst({ where: { activo: true } });

  // Inscripciones del ciclo activo
  const inscripciones = cicloActivo
    ? await prisma.inscripcion.findMany({
        where: { alumnoId: alumno.id, grupo: { cicloEscolarId: cicloActivo.id }, estatus: "INSCRITO" },
        include: {
          grupo: {
            include: {
              materia: { select: { id: true, clave: true, nombre: true, creditos: true } },
              docente: { select: { id: true, nombre: true } },
              horarios: true,
            },
          },
        },
      })
    : [];

  // Promedio general (usando la boleta para consistencia)
  const boletaRes = await obtenerBoletaAlumno(alumno.id);
  const promediosMateria = boletaRes.boleta.filter((b) => b.promedio != null).map((b) => b.promedio!);
  const promedioGeneral = promediosMateria.length > 0
    ? Math.round((promediosMateria.reduce((sum, p) => sum + p, 0) / promediosMateria.length) * 10) / 10
    : null;

  // Estado de cuenta resumido
  const colegiaturas = await prisma.colegiatura.findMany({
    where: { alumnoId: alumno.id, estatus: { in: ["PENDIENTE", "PARCIAL", "VENCIDA"] } },
    select: { total: true, estatus: true },
  });
  const saldoPendiente = colegiaturas.reduce((sum, c) => sum + Number(c.total), 0);

  // Avisos no leídos
  const avisosNoLeidos = await prisma.aviso.count({
    where: {
      activo: true,
      rolesDestino: { has: "ALUMNO" },
      OR: [{ fechaExpiracion: null }, { fechaExpiracion: { gte: new Date() } }],
      leidos: { none: { userId } },
    },
  });

  // Mensajes no leídos
  const mensajesNoLeidos = await prisma.mensaje.count({
    where: {
      conversacion: {
        OR: [{ participante1Id: userId }, { participante2Id: userId }],
      },
      remitenteId: { not: userId },
      leidoAt: null,
    },
  });

  return {
    alumno: {
      id: alumno.id,
      nombre: alumno.nombre,
      matricula: alumno.matricula,
      semestre: alumno.semestre,
      estatus: alumno.estatus,
      carrera: alumno.carrera,
    },
    cicloActivo: cicloActivo ? { id: cicloActivo.id, nombre: cicloActivo.nombre } : null,
    inscripciones: inscripciones.map((i) => ({
      grupoId: i.grupo.id,
      materia: i.grupo.materia,
      docente: i.grupo.docente,
      horarios: i.grupo.horarios,
    })),
    promedioGeneral,
    saldoPendiente: saldoPendiente.toFixed(2),
    colegiaturasPendientes: colegiaturas.length,
    avisosNoLeidos,
    mensajesNoLeidos,
  };
}

/**
 * Portal BFF — Docente: grupos, estadísticas, avisos.
 */
export async function portalDocente(userId: string) {
  const docente = await prisma.docenteProfile.findUnique({ where: { userId } });
  if (!docente) throw Object.assign(new Error("Perfil de docente no encontrado"), { statusCode: 404 });

  const cicloActivo = await prisma.cicloEscolar.findFirst({ where: { activo: true } });

  const grupos = cicloActivo
    ? await prisma.grupo.findMany({
        where: { docenteId: docente.id, cicloEscolarId: cicloActivo.id },
        include: {
          materia: { select: { id: true, clave: true, nombre: true } },
          horarios: true,
          _count: { select: { inscripciones: true } },
        },
      })
    : [];

  // Avisos publicados por el docente
  const avisosPublicados = await prisma.aviso.count({ where: { autorId: userId, activo: true } });

  // Avisos no leídos para el docente
  const avisosNoLeidos = await prisma.aviso.count({
    where: {
      activo: true,
      rolesDestino: { has: "DOCENTE" },
      OR: [{ fechaExpiracion: null }, { fechaExpiracion: { gte: new Date() } }],
      leidos: { none: { userId } },
    },
  });

  const mensajesNoLeidos = await prisma.mensaje.count({
    where: {
      conversacion: {
        OR: [{ participante1Id: userId }, { participante2Id: userId }],
      },
      remitenteId: { not: userId },
      leidoAt: null,
    },
  });

  return {
    docente: {
      id: docente.id,
      nombre: docente.nombre,
      especialidad: docente.especialidad,
    },
    cicloActivo: cicloActivo ? { id: cicloActivo.id, nombre: cicloActivo.nombre } : null,
    grupos: grupos.map((g) => ({
      id: g.id,
      clave: g.clave,
      materia: g.materia,
      aula: g.aula,
      horarios: g.horarios,
      inscritos: g._count.inscripciones,
      cupoMaximo: g.cupoMaximo,
    })),
    avisosPublicados,
    avisosNoLeidos,
    mensajesNoLeidos,
  };
}

/**
 * Portal BFF — Padre: datos de su(s) hijo(s).
 */
export async function portalPadre(userId: string) {
  const padre = await prisma.padreProfile.findUnique({
    where: { userId },
    include: {
      alumno: {
        include: {
          carrera: { select: { id: true, clave: true, nombre: true } },
          user: { select: { id: true, email: true } },
        },
      },
    },
  });
  if (!padre) throw Object.assign(new Error("Perfil de padre no encontrado"), { statusCode: 404 });

  let hijoData = null;

  if (padre.alumno) {
    const alumno = padre.alumno;

    // Promedio del hijo (usando la boleta para consistencia)
    const boletaRes = await obtenerBoletaAlumno(alumno.id);
    const promediosMateria = boletaRes.boleta.filter((b) => b.promedio != null).map((b) => b.promedio!);
    const promedio = promediosMateria.length > 0
      ? Math.round((promediosMateria.reduce((sum, p) => sum + p, 0) / promediosMateria.length) * 10) / 10
      : null;

    // Saldo pendiente
    const colegiaturas = await prisma.colegiatura.findMany({
      where: { alumnoId: alumno.id, estatus: { in: ["PENDIENTE", "PARCIAL", "VENCIDA"] } },
      select: { total: true },
    });
    const saldoPendiente = colegiaturas.reduce((sum, c) => sum + Number(c.total), 0);

    hijoData = {
      id: alumno.id,
      nombre: alumno.nombre,
      matricula: alumno.matricula,
      semestre: alumno.semestre,
      estatus: alumno.estatus,
      carrera: alumno.carrera,
      promedio,
      saldoPendiente: saldoPendiente.toFixed(2),
      colegiaturasPendientes: colegiaturas.length,
    };
  }

  // Avisos no leídos
  const avisosNoLeidos = await prisma.aviso.count({
    where: {
      activo: true,
      rolesDestino: { has: "PADRE" },
      OR: [{ fechaExpiracion: null }, { fechaExpiracion: { gte: new Date() } }],
      leidos: { none: { userId } },
    },
  });

  const mensajesNoLeidos = await prisma.mensaje.count({
    where: {
      conversacion: {
        OR: [{ participante1Id: userId }, { participante2Id: userId }],
      },
      remitenteId: { not: userId },
      leidoAt: null,
    },
  });

  return {
    padre: { id: padre.id, nombre: padre.nombre },
    hijo: hijoData,
    avisosNoLeidos,
    mensajesNoLeidos,
  };
}
