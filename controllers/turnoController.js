const { Turno, Grupo } = require('../models');
const { success, created, notFound, paginated, handleSequelizeError } = require('../utils/response');
const { buildQuery } = require('../utils/queryHelper');

exports.index = async (req, res) => {
  try {
    const { page, limit, offset, where, order } = buildQuery(req, {
      searchFields: ['nombre'],
      sortable: ['id', 'nombre', 'hora_inicio', 'hora_fin'],
      defaultOrder: [['hora_inicio', 'ASC']],
    });

    const { rows, count } = await Turno.findAndCountAll({ where, limit, offset, order });
    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.store = async (req, res) => {
  try {
    const turno = await Turno.create(req.body);
    return created(res, turno, 'Turno creado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.show = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id, {
      include: [{ model: Grupo, as: 'grupos' }],
    });
    if (!turno) return notFound(res, 'Turno no encontrado.');
    return success(res, turno);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return notFound(res, 'Turno no encontrado.');
    await turno.update(req.body);
    return success(res, turno, 'Turno actualizado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.destroy = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return notFound(res, 'Turno no encontrado.');
    await turno.destroy();
    return success(res, null, 'Turno eliminado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};
