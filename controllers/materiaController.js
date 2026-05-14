const { Op } = require('sequelize');
const { Materia, Maestro, Grupo, Horario } = require('../models');
const { success, created, notFound, paginated, error } = require('../utils/response');

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${req.query.search}%` } },
        { codigo: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows, count } = await Materia.findAndCountAll({
      where,
      include: [{ model: Maestro, as: 'maestros' }],
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
    const materia = await Materia.create(req.body);
    return created(res, materia);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.show = async (req, res) => {
  try {
    const materia = await Materia.findByPk(req.params.id, {
      include: [
        { model: Maestro, as: 'maestros' },
        { model: Grupo, as: 'grupos' },
        { model: Horario, as: 'horarios' },
      ],
    });

    if (!materia) return notFound(res);
    return success(res, materia);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const materia = await Materia.findByPk(req.params.id);
    if (!materia) return notFound(res);

    await materia.update(req.body);
    return success(res, materia);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const materia = await Materia.findByPk(req.params.id);
    if (!materia) return notFound(res);

    await materia.destroy();
    return success(res, null, 'Materia eliminada exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};
