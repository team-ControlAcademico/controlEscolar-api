import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const kardexService = {
  async obtenerKardex(alumnoId: string) {
    const alumno = await prisma.alumnoProfile.findUnique({
      where: { id: alumnoId },
      include: {
        user: true,
        carrera: true,
        calificaciones: {
          include: {
            grupo: {
              include: {
                materia: true,
                cicloEscolar: true,
              },
            },
          },
        },
      },
    });

    if (!alumno) {
      throw new Error("Alumno no encontrado");
    }

    // Agrupar calificaciones por materia (usando la mejor calificación o el promedio final)
    // Para simplificar, tomamos el promedio de las unidades por grupo, y si aprueba,
    // se cuenta como crédito obtenido.
    const materiasCursadas = new Map<string, any>();
    
    let creditosObtenidos = 0;
    let sumaPromedios = 0;
    let materiasAprobadasCount = 0;

    alumno.calificaciones.forEach((cal) => {
      const materia = cal.grupo.materia;
      const key = materia.id;
      
      if (!materiasCursadas.has(key)) {
        materiasCursadas.set(key, {
          materia: materia.nombre,
          clave: materia.clave,
          creditos: materia.creditos,
          calificaciones: [],
          promedio: 0,
          aprobada: false,
          ciclo: cal.grupo.cicloEscolar.nombre,
        });
      }
      
      const registro = materiasCursadas.get(key);
      registro.calificaciones.push(cal.calificacion);
    });

    const historial = Array.from(materiasCursadas.values()).map((registro) => {
      const sum = registro.calificaciones.reduce((a: number, b: number) => a + b, 0);
      registro.promedio = registro.calificaciones.length > 0 ? sum / registro.calificaciones.length : 0;
      registro.aprobada = registro.promedio >= 7.0; // Suponiendo que 7.0 es el mínimo aprobatorio

      if (registro.aprobada) {
        creditosObtenidos += registro.creditos;
        sumaPromedios += registro.promedio;
        materiasAprobadasCount++;
      }

      return registro;
    });

    const creditosTotales = alumno.carrera?.creditosTotales || 0;
    const porcentajeAvance = creditosTotales > 0 ? (creditosObtenidos / creditosTotales) * 100 : 0;
    const promedioGeneral = materiasAprobadasCount > 0 ? (sumaPromedios / materiasAprobadasCount) : 0;

    return {
      alumno: {
        id: alumno.id,
        nombre: alumno.nombre,
        matricula: alumno.matricula,
        carrera: alumno.carrera?.nombre || "Sin carrera asignada",
      },
      historial,
      resumen: {
        creditosObtenidos,
        creditosTotales,
        porcentajeAvance: porcentajeAvance.toFixed(2),
        promedioGeneral: promedioGeneral.toFixed(2),
      },
    };
  }
};
