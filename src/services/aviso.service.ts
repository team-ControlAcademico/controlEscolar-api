import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CrearAvisoInput {
  titulo: string;
  contenido: string;
  tipo?: string;
  rolesDestino: string[];
  fechaExpiracion?: string;
}

export async function crearAviso(autorId: string, input: CrearAvisoInput) {
  return prisma.aviso.create({
    data: {
      titulo: input.titulo,
      contenido: input.contenido,
      tipo: input.tipo ?? "GENERAL",
      rolesDestino: input.rolesDestino,
      fechaExpiracion: input.fechaExpiracion ? new Date(input.fechaExpiracion) : null,
      autorId,
    },
    include: {
      autor: { select: { id: true, email: true, role: true } },
    },
  });
}

export async function listarAvisos(filters?: { tipo?: string; activo?: boolean }) {
  return prisma.aviso.findMany({
    where: {
      ...(filters?.tipo && { tipo: filters.tipo }),
      activo: filters?.activo ?? true,
    },
    include: {
      autor: { select: { id: true, email: true, role: true } },
      _count: { select: { leidos: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function obtenerAviso(id: string) {
  const aviso = await prisma.aviso.findUnique({
    where: { id },
    include: {
      autor: { select: { id: true, email: true, role: true } },
      _count: { select: { leidos: true } },
    },
  });
  if (!aviso) throw Object.assign(new Error("Aviso no encontrado"), { statusCode: 404 });
  return aviso;
}

export async function eliminarAviso(id: string) {
  await prisma.aviso.delete({ where: { id } });
}

export async function marcarLeido(avisoId: string, userId: string) {
  return prisma.avisoLeido.upsert({
    where: { avisoId_userId: { avisoId, userId } },
    update: {},
    create: { avisoId, userId },
  });
}

/**
 * Obtiene avisos dirigidos al rol del usuario, indicando cuáles ya leyó.
 */
export async function misAvisos(userId: string, role: string) {
  const avisos = await prisma.aviso.findMany({
    where: {
      activo: true,
      rolesDestino: { has: role },
      OR: [
        { fechaExpiracion: null },
        { fechaExpiracion: { gte: new Date() } },
      ],
    },
    include: {
      autor: { select: { id: true, email: true, role: true } },
      leidos: {
        where: { userId },
        select: { id: true, leidoAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return avisos.map((a) => ({
    ...a,
    leido: a.leidos.length > 0,
    leidoAt: a.leidos[0]?.leidoAt ?? null,
    leidos: undefined,
  }));
}

/**
 * Contador de avisos no leídos para el usuario.
 */
export async function contadorNoLeidos(userId: string, role: string) {
  const total = await prisma.aviso.count({
    where: {
      activo: true,
      rolesDestino: { has: role },
      OR: [
        { fechaExpiracion: null },
        { fechaExpiracion: { gte: new Date() } },
      ],
      leidos: { none: { userId } },
    },
  });
  return total;
}
