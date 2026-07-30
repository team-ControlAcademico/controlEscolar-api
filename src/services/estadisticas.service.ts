import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const estadisticasService = {
  async obtenerDashboardData() {
    // 1. Conteo de alumnos activos
    const totalAlumnos = await prisma.alumnoProfile.count({
      where: { estatus: "ACTIVO" }
    });

    // 2. Alumnos por carrera
    const alumnosPorCarrera = await prisma.carrera.findMany({
      select: {
        nombre: true,
        _count: {
          select: { alumnos: true }
        }
      }
    });

    // 3. Estatus de colegiaturas en el mes actual (simulado con todo el histórico para MVP)
    const colegiaturas = await prisma.colegiatura.groupBy({
      by: ['estatus'],
      _count: { estatus: true },
      _sum: { total: true }
    });

    // 4. Progreso de trámites de titulación
    const tramiteTitulos = await prisma.tramiteTitulacion.groupBy({
      by: ['estado'],
      _count: { estado: true }
    });

    return {
      kpis: {
        totalAlumnos,
        ingresosTotales: colegiaturas
          .filter(c => c.estatus === "PAGADA")
          .reduce((acc, curr) => acc + Number(curr._sum.total || 0), 0),
        tituladosTotales: tramiteTitulos
          .find(t => t.estado === "TITULADO")?._count.estado || 0,
      },
      graficas: {
        poblacionPorCarrera: alumnosPorCarrera.map(c => ({
          carrera: c.nombre,
          cantidad: c._count.alumnos
        })),
        estadoColegiaturas: colegiaturas.map(c => ({
          estatus: c.estatus,
          cantidad: c._count.estatus,
          monto: Number(c._sum.total || 0)
        })),
        titulacionProgress: tramiteTitulos.map(t => ({
          estado: t.estado,
          cantidad: t._count.estado
        }))
      }
    };
  }
};
