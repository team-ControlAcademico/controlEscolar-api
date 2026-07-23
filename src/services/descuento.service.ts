import { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import type { DescuentoInput, DescuentoUpdateInput } from "../schemas/finanzas.schema";

const prisma = new PrismaClient();

export async function listarDescuentos() {
  return prisma.descuento.findMany({ orderBy: { createdAt: "desc" } });
}

export async function obtenerDescuento(id: string) {
  const descuento = await prisma.descuento.findUnique({ where: { id } });
  if (!descuento) throw new AppError("Descuento no encontrado", 404);
  return descuento;
}

export async function crearDescuento(data: DescuentoInput) {
  if (data.tipo === "PORCENTAJE" && data.valor > 100) {
    throw new AppError("Un descuento porcentual no puede superar 100%", 400);
  }
  const existe = await prisma.descuento.findUnique({ where: { concepto: data.concepto } });
  if (existe) throw new AppError("Ya existe un descuento con ese concepto", 409);

  return prisma.descuento.create({
    data: {
      concepto: data.concepto,
      tipo: data.tipo,
      valor: new Prisma.Decimal(data.valor),
      descripcion: data.descripcion || null,
      activo: data.activo,
    },
  });
}

export async function actualizarDescuento(id: string, data: DescuentoUpdateInput) {
  await obtenerDescuento(id);
  if (data.tipo === "PORCENTAJE" && data.valor !== undefined && data.valor > 100) {
    throw new AppError("Un descuento porcentual no puede superar 100%", 400);
  }
  if (data.concepto) {
    const existe = await prisma.descuento.findFirst({ where: { concepto: data.concepto, NOT: { id } } });
    if (existe) throw new AppError("Ya existe un descuento con ese concepto", 409);
  }
  return prisma.descuento.update({
    where: { id },
    data: {
      concepto: data.concepto,
      tipo: data.tipo,
      valor: data.valor !== undefined ? new Prisma.Decimal(data.valor) : undefined,
      descripcion: data.descripcion,
      activo: data.activo,
    },
  });
}

export async function eliminarDescuento(id: string) {
  await obtenerDescuento(id);
  return prisma.descuento.delete({ where: { id } });
}
