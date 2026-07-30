import { Request, Response } from "express";
import { kardexService } from "../services/kardex.service";
import { documentosService } from "../services/documentos.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const obtenerKardex = async (req: Request, res: Response) => {
  try {
    const { alumnoId } = req.params;
    const data = await kardexService.obtenerKardex(alumnoId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const descargarKardexPDF = async (req: Request, res: Response) => {
  try {
    const { alumnoId } = req.params;
    const pdfBuffer = await documentosService.generarKardexPDF(alumnoId);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=kardex_${alumnoId}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listarTramitesTitulacion = async (req: Request, res: Response) => {
  try {
    const tramites = await prisma.tramiteTitulacion.findMany({
      include: {
        alumno: {
          include: { alumno: { include: { carrera: true } } }
        }
      }
    });
    
    const mapped = tramites.map(t => ({
      id: t.id,
      estado: t.estado,
      observaciones: t.observaciones,
      alumno: {
        nombre: t.alumno.alumno?.nombre || "Sin nombre",
        matricula: t.alumno.alumno?.matricula || "N/A",
        carrera: t.alumno.alumno?.carrera || null
      }
    }));
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizarEstadoTitulacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;
    
    const tramite = await prisma.tramiteTitulacion.update({
      where: { id },
      data: { estado, observaciones }
    });
    
    res.json(tramite);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
