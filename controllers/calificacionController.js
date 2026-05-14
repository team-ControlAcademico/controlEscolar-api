const { Calificacion, Alumno, Materia, Maestro } = require('../models');
const { success, created, notFound, paginated, error } = require('../utils/response');

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.alumno_id) where.alumno_id = req.query.alumno_id;
    if (req.query.materia_id) where.materia_id = req.query.materia_id;
    if (req.query.parcial) where.parcial = req.query.parcial;

    const { rows, count } = await Calificacion.findAndCountAll({
      where,
      include: [
        { model: Alumno, as: 'alumno' },
        { model: Materia, as: 'materia' },
        { model: Maestro, as: 'maestro' },
      ],
      limit,
      offset,
      order: [['id', 'DESC']],
    });

    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    const calificacion = await Calificacion.create(req.body);
    return created(res, calificacion);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.show = async (req, res) => {
  try {
    const calificacion = await Calificacion.findByPk(req.params.id, {
      include: [
        { model: Alumno, as: 'alumno' },
        { model: Materia, as: 'materia' },
        { model: Maestro, as: 'maestro' },
      ],
    });

    if (!calificacion) return notFound(res);
    return success(res, calificacion);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const calificacion = await Calificacion.findByPk(req.params.id);
    if (!calificacion) return notFound(res);

    await calificacion.update(req.body);
    return success(res, calificacion);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const calificacion = await Calificacion.findByPk(req.params.id);
    if (!calificacion) return notFound(res);

    await calificacion.destroy();
    return success(res, null, 'Calificacion eliminada exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.porAlumno = async (req, res) => {
  try {
    const calificaciones = await Calificacion.findAll({
      where: { alumno_id: req.params.alumnoId },
      include: [
        { model: Materia, as: 'materia' },
        { model: Maestro, as: 'maestro' },
      ],
      order: [['parcial', 'ASC']],
    });

    return success(res, calificaciones);
  } catch (err) {
    return error(res, err.message);
  }
};
