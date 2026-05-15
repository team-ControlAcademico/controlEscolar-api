const { fn, col, Op } = require('sequelize');
const { Alumno, Maestro, Grupo, Materia, Padre, Calificacion, Asistencia } = require('../models');
const { success, error } = require('../utils/response');

exports.stats = async (req, res) => {
  try {
    const totalAlumnos = await Alumno.count();
    const gruposActivos = await Grupo.count();

    const promedioResult = await Calificacion.findAll({
      attributes: [[fn('AVG', col('calificacion')), 'promedio']],
      raw: true,
    });
    const promedioGeneral = promedioResult[0]?.promedio
      ? parseFloat(promedioResult[0].promedio).toFixed(1)
      : 0;

    const hoy = new Date().toISOString().split('T')[0];
    const totalAsistencia = await Asistencia.count({ where: { fecha: hoy } });
    const presentes = await Asistencia.count({ where: { fecha: hoy, estado: 'presente' } });
    const asistencia = totalAsistencia > 0
      ? `${Math.round((presentes / totalAsistencia) * 100)}%`
      : '0%';

    return success(res, {
      totalAlumnos,
      gruposActivos,
      promedioGeneral: parseFloat(promedioGeneral),
      asistencia,
    });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.actividad = async (req, res) => {
  try {
    const ultimasAsistencias = await Asistencia.findAll({
      include: [{ model: Alumno, as: 'alumno', attributes: ['nombre', 'apellido_paterno'] }],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    const actividad = ultimasAsistencias.map((a) => ({
      nombre: `${a.alumno.nombre} ${a.alumno.apellido_paterno}`,
      accion: `Marcó ${a.estado}`,
      tiempo: a.created_at,
    }));

    return success(res, actividad);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.asistenciaHoy = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const total = await Asistencia.count({ where: { fecha: hoy } });
    const presentes = await Asistencia.count({ where: { fecha: hoy, estado: 'presente' } });
    const ausentes = await Asistencia.count({ where: { fecha: hoy, estado: 'ausente' } });
    const justificados = await Asistencia.count({ where: { fecha: hoy, estado: 'justificado' } });
    const retardos = await Asistencia.count({ where: { fecha: hoy, estado: 'retardo' } });

    return success(res, {
      fecha: hoy,
      total,
      presentes,
      ausentes,
      justificados,
      retardos,
    });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.promedioCalificaciones = async (req, res) => {
  try {
    const result = await Calificacion.findAll({
      attributes: [
        [fn('AVG', col('calificacion')), 'promedio'],
        [fn('MAX', col('calificacion')), 'maxima'],
        [fn('MIN', col('calificacion')), 'minima'],
      ],
      raw: true,
    });

    const { promedio, maxima, minima } = result[0];

    return success(res, {
      promedio: promedio ? parseFloat(promedio).toFixed(2) : 0,
      maxima: maxima ? parseFloat(maxima).toFixed(2) : 0,
      minima: minima ? parseFloat(minima).toFixed(2) : 0,
    });
  } catch (err) {
    return error(res, err.message);
  }
};
