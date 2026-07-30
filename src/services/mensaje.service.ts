import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helpers para el nombre de perfil de un usuario
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

const profileIncludes = {
  admin: { select: { nombre: true } },
  escolar: { select: { nombre: true } },
  administrativo: { select: { nombre: true } },
  docente: { select: { nombre: true } },
  alumno: { select: { nombre: true, matricula: true } },
  padre: { select: { nombre: true } },
};

/**
 * Crea o retorna la conversación existente entre dos usuarios.
 * Los IDs se ordenan para que la constraint unique funcione sin importar el orden.
 */
export async function crearConversacion(userId1: string, userId2: string) {
  if (userId1 === userId2) {
    throw Object.assign(new Error("No puedes crear una conversación contigo mismo"), { statusCode: 400 });
  }

  const [p1, p2] = [userId1, userId2].sort();

  // Buscar existente
  const existente = await prisma.conversacion.findUnique({
    where: { participante1Id_participante2Id: { participante1Id: p1, participante2Id: p2 } },
    include: {
      participante1: { select: { id: true, email: true, role: true, ...profileIncludes } },
      participante2: { select: { id: true, email: true, role: true, ...profileIncludes } },
    },
  });

  if (existente) return formatConversacion(existente, userId1);

  const nueva = await prisma.conversacion.create({
    data: { participante1Id: p1, participante2Id: p2 },
    include: {
      participante1: { select: { id: true, email: true, role: true, ...profileIncludes } },
      participante2: { select: { id: true, email: true, role: true, ...profileIncludes } },
    },
  });

  return formatConversacion(nueva, userId1);
}

function formatConversacion(conv: any, currentUserId: string) {
  const otro = conv.participante1.id === currentUserId ? conv.participante2 : conv.participante1;
  return {
    id: conv.id,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    otro: {
      id: otro.id,
      email: otro.email,
      role: otro.role,
      nombre: getProfileName(otro),
    },
  };
}

/**
 * Lista conversaciones del usuario con último mensaje y conteo de no leídos.
 */
export async function listarConversaciones(userId: string) {
  const conversaciones = await prisma.conversacion.findMany({
    where: {
      OR: [
        { participante1Id: userId },
        { participante2Id: userId },
      ],
    },
    include: {
      participante1: { select: { id: true, email: true, role: true, ...profileIncludes } },
      participante2: { select: { id: true, email: true, role: true, ...profileIncludes } },
      mensajes: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Conteo de no leídos por conversación
  const resultado = await Promise.all(
    conversaciones.map(async (conv) => {
      const noLeidos = await prisma.mensaje.count({
        where: {
          conversacionId: conv.id,
          remitenteId: { not: userId },
          leidoAt: null,
        },
      });

      const otro = conv.participante1.id === userId ? conv.participante2 : conv.participante1;
      const ultimoMensaje = conv.mensajes[0] ?? null;

      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        otro: {
          id: otro.id,
          email: otro.email,
          role: otro.role,
          nombre: getProfileName(otro),
        },
        ultimoMensaje: ultimoMensaje
          ? { id: ultimoMensaje.id, contenido: ultimoMensaje.contenido, createdAt: ultimoMensaje.createdAt, esMio: ultimoMensaje.remitenteId === userId }
          : null,
        noLeidos,
      };
    })
  );

  return resultado;
}

/**
 * Lista mensajes de una conversación. Marca como leídos los del otro participante.
 */
export async function listarMensajes(conversacionId: string, userId: string) {
  // Verificar que el usuario es participante
  const conv = await prisma.conversacion.findUnique({ where: { id: conversacionId } });
  if (!conv || (conv.participante1Id !== userId && conv.participante2Id !== userId)) {
    throw Object.assign(new Error("No tienes acceso a esta conversación"), { statusCode: 403 });
  }

  // Marcar como leídos los mensajes del otro
  await prisma.mensaje.updateMany({
    where: {
      conversacionId,
      remitenteId: { not: userId },
      leidoAt: null,
    },
    data: { leidoAt: new Date() },
  });

  const mensajes = await prisma.mensaje.findMany({
    where: { conversacionId },
    include: {
      remitente: { select: { id: true, email: true, role: true, ...profileIncludes } },
    },
    orderBy: { createdAt: "asc" },
  });

  return mensajes.map((m) => ({
    id: m.id,
    contenido: m.contenido,
    createdAt: m.createdAt,
    leidoAt: m.leidoAt,
    remitente: {
      id: m.remitente.id,
      email: m.remitente.email,
      role: m.remitente.role,
      nombre: getProfileName(m.remitente),
    },
    esMio: m.remitenteId === userId,
  }));
}

/**
 * Envía un mensaje en una conversación. Actualiza el timestamp de la conversación.
 */
export async function enviarMensaje(conversacionId: string, remitenteId: string, contenido: string) {
  const conv = await prisma.conversacion.findUnique({ where: { id: conversacionId } });
  if (!conv || (conv.participante1Id !== remitenteId && conv.participante2Id !== remitenteId)) {
    throw Object.assign(new Error("No tienes acceso a esta conversación"), { statusCode: 403 });
  }

  const [mensaje] = await prisma.$transaction([
    prisma.mensaje.create({
      data: { conversacionId, remitenteId, contenido },
      include: {
        remitente: { select: { id: true, email: true, role: true, ...profileIncludes } },
      },
    }),
    prisma.conversacion.update({
      where: { id: conversacionId },
      data: { updatedAt: new Date() },
    }),
  ]);

  const destinatarioId = conv.participante1Id === remitenteId ? conv.participante2Id : conv.participante1Id;

  return {
    mensaje: {
      id: mensaje.id,
      contenido: mensaje.contenido,
      createdAt: mensaje.createdAt,
      leidoAt: mensaje.leidoAt,
      remitente: {
        id: mensaje.remitente.id,
        email: mensaje.remitente.email,
        role: mensaje.remitente.role,
        nombre: getProfileName(mensaje.remitente),
      },
      esMio: true,
    },
    destinatarioId,
    conversacionId,
  };
}

/**
 * Lista usuarios disponibles para iniciar chat (excluye al usuario actual).
 */
export async function listarUsuariosDisponibles(userId: string) {
  const usuarios = await prisma.user.findMany({
    where: { id: { not: userId }, isActive: true },
    select: { id: true, email: true, role: true, ...profileIncludes },
    orderBy: { role: "asc" },
  });

  return usuarios.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    nombre: getProfileName(u),
  }));
}
