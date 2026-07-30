import { Request, Response } from "express";
import { estadisticasService } from "../services/estadisticas.service";
import { exportadorService } from "../services/exportador.service";

export const obtenerDashboard = async (req: Request, res: Response) => {
  try {
    const data = await estadisticasService.obtenerDashboardData();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const descargarReporteAlumnos = async (req: Request, res: Response) => {
  try {
    const excelBuffer = await exportadorService.generarReporteAlumnos();
    
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=reporte_alumnos_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
