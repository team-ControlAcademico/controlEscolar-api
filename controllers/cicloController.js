const { Ciclo, Grupo } = require('../models');
const { success, created, notFound, paginated, handleSequelizeError } = require('../utils/response');
const { buildQuery } = require('../utils/queryHelper');

exports.index = async (req, res) => {
  try {
    const { page, limit, offset, where, order } = buildQuery(req, {
      searchFields: ['nombre'],
      filterFields: ['activo'],
      sortable: ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'activo'],
      defaultOrder: [['fecha_inicio', 'DESC']],
    });

    const { rows, count } = await Ciclo.findAndCountAll({ where, limit, offset, order });
    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.store = async (req, res) => {
  try {
    const ciclo = await Ciclo.create(req.body);
    return created(res, ciclo, 'Ciclo escolar creado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.show = async (req, res) => {
  try {
    const ciclo = await Ciclo.findByPk(req.params.id, {
      include: [{ model: Grupo, as: 'grupos' }],
    });
    if (!ciclo) return notFound(res, 'Ciclo escolar no encontrado.');
    return success(res, ciclo);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const ciclo = await Ciclo.findByPk(req.params.id);
    if (!ciclo) return notFound(res, 'Ciclo escolar no encontrado.');
    await ciclo.update(req.body);
    return success(res, ciclo, 'Ciclo escolar actualizado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.destroy = async (req, res) => {
  try {
    const ciclo = await Ciclo.findByPk(req.params.id);
    if (!ciclo) return notFound(res, 'Ciclo escolar no encontrado.');
    await ciclo.destroy();
    return success(res, null, 'Ciclo escolar eliminado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};
