const { Op } = require('sequelize');
const { Maestro, Materia } = require('../models');
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
        { apellido_paterno: { [Op.iLike]: `%${req.query.search}%` } },
        { num_empleado: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows, count } = await Maestro.findAndCountAll({
      where,
      include: [{ model: Materia, as: 'materias' }],
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
    const maestro = await Maestro.create(req.body);
    return created(res, maestro);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.show = async (req, res) => {
  try {
    const maestro = await Maestro.findByPk(req.params.id, {
      include: [{ model: Materia, as: 'materias' }],
    });

    if (!maestro) return notFound(res);
    return success(res, maestro);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const maestro = await Maestro.findByPk(req.params.id);
    if (!maestro) return notFound(res);

    await maestro.update(req.body);
    return success(res, maestro);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const maestro = await Maestro.findByPk(req.params.id);
    if (!maestro) return notFound(res);

    await maestro.destroy();
    return success(res, null, 'Maestro eliminado exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};
