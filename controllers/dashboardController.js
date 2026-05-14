const { fn, col, Op } = require('sequelize');
const { Alumno, Maestro, Grupo, Materia, Padre, Calificacion, Asistencia } = require('../models');
const { success, error } = require('../utils/response');

exports.stats = async (req, res) => {
  try {
    const [alumnos, maestros, grupos, materias, padres] = await Promise.all([
      Alumno.count(),
      Maestro.count(),
      Grupo.count(),
      Materia.count(),
      Padre.count(),
    ]);

    return success(res, { alumnos, maestros, grupos, materias, padres });
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
