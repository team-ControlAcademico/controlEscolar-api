const { Grado, Grupo } = require('../models');
const { success, created, notFound, paginated, handleSequelizeError } = require('../utils/response');
const { buildQuery } = require('../utils/queryHelper');

exports.index = async (req, res) => {
  try {
    const { page, limit, offset, where, order } = buildQuery(req, {
      searchFields: ['nombre', 'nivel'],
      filterFields: ['nivel'],
      sortable: ['id', 'nombre', 'nivel', 'orden'],
      defaultOrder: [['orden', 'ASC']],
    });

    const { rows, count } = await Grado.findAndCountAll({ where, limit, offset, order });
    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.store = async (req, res) => {
  try {
    const grado = await Grado.create(req.body);
    return created(res, grado, 'Grado creado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.show = async (req, res) => {
  try {
    const grado = await Grado.findByPk(req.params.id, {
      include: [{ model: Grupo, as: 'grupos' }],
    });
    if (!grado) return notFound(res, 'Grado no encontrado.');
    return success(res, grado);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.update = async (req, res) => {
  try {
    const grado = await Grado.findByPk(req.params.id);
    if (!grado) return notFound(res, 'Grado no encontrado.');
    await grado.update(req.body);
    return success(res, grado, 'Grado actualizado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};

exports.destroy = async (req, res) => {
  try {
    const grado = await Grado.findByPk(req.params.id);
    if (!grado) return notFound(res, 'Grado no encontrado.');
    await grado.destroy();
    return success(res, null, 'Grado eliminado exitosamente.');
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};
