const { Op } = require('sequelize');
const { Padre, Alumno, Grupo, User } = require('../models');
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
        { email: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows, count } = await Padre.findAndCountAll({
      where,
      include: [{ model: Alumno, as: 'alumnos' }],
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
    const padre = await Padre.create(req.body);
    return created(res, padre);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.show = async (req, res) => {
  try {
    const padre = await Padre.findByPk(req.params.id, {
      include: [
        {
          model: Alumno,
          as: 'alumnos',
          include: [{ model: Grupo, as: 'grupo' }],
        },
        { model: User, as: 'user' },
      ],
    });

    if (!padre) return notFound(res);
    return success(res, padre);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const padre = await Padre.findByPk(req.params.id);
    if (!padre) return notFound(res);

    await padre.update(req.body);
    return success(res, padre);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const padre = await Padre.findByPk(req.params.id);
    if (!padre) return notFound(res);

    await padre.destroy();
    return success(res, null, 'Padre eliminado exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};
