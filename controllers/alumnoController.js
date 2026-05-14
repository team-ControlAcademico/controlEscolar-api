const { Op } = require('sequelize');
const { Alumno, Grupo, Padre, Calificacion, Materia, Asistencia } = require('../models');
const { success, created, notFound, paginated, error } = require('../utils/response');

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.grupo_id) {
      where.grupo_id = req.query.grupo_id;
    }
    if (req.query.search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${req.query.search}%` } },
        { apellido_paterno: { [Op.iLike]: `%${req.query.search}%` } },
        { matricula: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows, count } = await Alumno.findAndCountAll({
      where,
      include: [
        { model: Grupo, as: 'grupo' },
        { model: Padre, as: 'padre' },
      ],
      limit,
      offset,
      order: [['nombre', 'ASC']],
    });

    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    const alumno = await Alumno.create(req.body);
    return created(res, alumno);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.show = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id, {
      include: [
        { model: Grupo, as: 'grupo' },
        { model: Padre, as: 'padre' },
        {
          model: Calificacion,
          as: 'calificaciones',
          include: [{ model: Materia, as: 'materia' }],
        },
        { model: Asistencia, as: 'asistencias' },
      ],
    });

    if (!alumno) return notFound(res);
    return success(res, alumno);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) return notFound(res);

    await alumno.update(req.body);
    return success(res, alumno);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const alumno = await Alumno.findByPk(req.params.id);
    if (!alumno) return notFound(res);

    await alumno.destroy();
    return success(res, null, 'Alumno eliminado exitosamente.');
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
        { model: require('../models').Maestro, as: 'maestro' },
      ],
      order: [['parcial', 'ASC']],
    });

    return success(res, calificaciones);
  } catch (err) {
    return error(res, err.message);
  }
};
