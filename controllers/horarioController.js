const { Horario, Materia, Maestro, Grupo } = require('../models');
const { success, created, notFound, paginated, error } = require('../utils/response');

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.grupo_id) where.grupo_id = req.query.grupo_id;
    if (req.query.maestro_id) where.maestro_id = req.query.maestro_id;
    if (req.query.dia_semana) where.dia_semana = req.query.dia_semana;

    const { rows, count } = await Horario.findAndCountAll({
      where,
      include: [
        { model: Materia, as: 'materia' },
        { model: Maestro, as: 'maestro' },
        { model: Grupo, as: 'grupo' },
      ],
      limit,
      offset,
      order: [['dia_semana', 'ASC'], ['hora_inicio', 'ASC']],
    });

    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.store = async (req, res) => {
  try {
    const horario = await Horario.create(req.body);
    return created(res, horario);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.show = async (req, res) => {
  try {
    const horario = await Horario.findByPk(req.params.id, {
      include: [
        { model: Materia, as: 'materia' },
        { model: Maestro, as: 'maestro' },
        { model: Grupo, as: 'grupo' },
      ],
    });

    if (!horario) return notFound(res);
    return success(res, horario);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const horario = await Horario.findByPk(req.params.id);
    if (!horario) return notFound(res);

    await horario.update(req.body);
    return success(res, horario);
  } catch (err) {
    return error(res, err.message);
  }
};

exports.destroy = async (req, res) => {
  try {
    const horario = await Horario.findByPk(req.params.id);
    if (!horario) return notFound(res);

    await horario.destroy();
    return success(res, null, 'Horario eliminado exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};
