const { Asistencia, Alumno } = require('../models');
const { success, created, notFound, paginated, error } = require('../utils/response');

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.alumno_id) where.alumno_id = req.query.alumno_id;
    if (req.query.fecha) where.fecha = req.query.fecha;
    if (req.query.estado) where.estado = req.query.estado;

    const { rows, count } = await Asistencia.findAndCountAll({
      where,
      include: [{ model: Alumno, as: 'alumno' }],
      limit,
      offset,
      order: [['fecha', 'DESC']],
    });

    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    const asistencia = await Asistencia.create(req.body);
    return created(res, asistencia);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.show = async (req, res) => {
  try {
    const asistencia = await Asistencia.findByPk(req.params.id, {
      include: [{ model: Alumno, as: 'alumno' }],
    });

    if (!asistencia) return notFound(res);
    return success(res, asistencia);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const asistencia = await Asistencia.findByPk(req.params.id);
    if (!asistencia) return notFound(res);

    await asistencia.update(req.body);
    return success(res, asistencia);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const asistencia = await Asistencia.findByPk(req.params.id);
    if (!asistencia) return notFound(res);

    await asistencia.destroy();
    return success(res, null, 'Asistencia eliminada exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.registrarAsistenciaMultiple = async (req, res) => {
  try {
    const { fecha, registros } = req.body;

    if (!fecha || !registros || !Array.isArray(registros)) {
      return error(res, 'Se requiere fecha y un array de registros.', 422);
    }

    const resultados = await Promise.all(
      registros.map(async (registro) => {
        const [asistencia, created] = await Asistencia.findOrCreate({
          where: { alumno_id: registro.alumno_id, fecha },
          defaults: {
            estado: registro.estado,
            observaciones: registro.observaciones || null,
          },
        });

        if (!created) {
          await asistencia.update({
            estado: registro.estado,
            observaciones: registro.observaciones || asistencia.observaciones,
          });
        }

        return asistencia;
      })
    );

    return success(res, resultados, 'Asistencias registradas exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};
