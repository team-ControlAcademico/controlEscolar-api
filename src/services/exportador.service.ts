import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const exportadorService = {
  async generarReporteAlumnos(): Promise<Buffer> {
    const alumnos = await prisma.alumnoProfile.findMany({
      include: {
        carrera: true,
      }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Alumnos");

    sheet.columns = [
      { header: "Matrícula", key: "matricula", width: 15 },
      { header: "Nombre", key: "nombre", width: 35 },
      { header: "Carrera", key: "carrera", width: 30 },
      { header: "Semestre", key: "semestre", width: 10 },
      { header: "Estatus", key: "estatus", width: 15 },
    ];

    // Estilos de encabezado
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    alumnos.forEach(alumno => {
      sheet.addRow({
        matricula: alumno.matricula,
        nombre: alumno.nombre,
        carrera: alumno.carrera?.nombre || "N/A",
        semestre: alumno.semestre,
        estatus: alumno.estatus
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    // ExcelJS devuelve un node buffer, lo convertimos a un JS native buffer si es necesario
    return buffer as unknown as Buffer;
  }
};
