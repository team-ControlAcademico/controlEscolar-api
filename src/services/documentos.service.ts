import PDFDocument from "pdfkit";
import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import { kardexService } from "./kardex.service";

const prisma = new PrismaClient();

export const documentosService = {
  async generarKardexPDF(alumnoId: string): Promise<Buffer> {
    const data = await kardexService.obtenerKardex(alumnoId);
    
    // Generar sello digital único
    const rawData = `${alumnoId}-${data.resumen.promedioGeneral}-${new Date().toISOString()}`;
    const selloDigital = createHash("sha256").update(rawData).digest("hex");

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];
        
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        // Encabezado
        doc.fontSize(20).text("UNIVERSIDAD CONTROL ESCOLAR", { align: "center" });
        doc.moveDown();
        doc.fontSize(16).text("Kárdex Académico", { align: "center" });
        doc.moveDown();

        // Datos del alumno
        doc.fontSize(12);
        doc.text(`Nombre: ${data.alumno.nombre}`);
        doc.text(`Matrícula: ${data.alumno.matricula}`);
        doc.text(`Carrera: ${data.alumno.carrera}`);
        doc.moveDown();

        // Tabla de calificaciones
        doc.text("Historial Académico:", { underline: true });
        doc.moveDown(0.5);
        
        data.historial.forEach((materia: any) => {
          doc.text(
            `${materia.clave} - ${materia.materia} | Promedio: ${materia.promedio.toFixed(2)} | Estatus: ${materia.aprobada ? "APROBADA" : "REPROBADA"}`
          );
        });
        doc.moveDown();

        // Resumen
        doc.text("Resumen:", { underline: true });
        doc.moveDown(0.5);
        doc.text(`Créditos Obtenidos: ${data.resumen.creditosObtenidos} / ${data.resumen.creditosTotales}`);
        doc.text(`Avance: ${data.resumen.porcentajeAvance}%`);
        doc.text(`Promedio General: ${data.resumen.promedioGeneral}`);
        doc.moveDown();

        // Sello Digital
        doc.fontSize(8).fillColor("gray");
        doc.text(`Sello Digital: ${selloDigital}`);
        doc.text(`Fecha de Emisión: ${new Date().toLocaleString()}`);

        doc.end();

        // Registrar documento en BD (opcional/asíncrono)
        prisma.documentoOficial.create({
          data: {
            alumnoId,
            tipo: "KARDEX",
            folio: `KDX-${Date.now()}`,
            selloDigital,
          }
        }).catch(console.error);

      } catch (error) {
        reject(error);
      }
    });
  }
};
