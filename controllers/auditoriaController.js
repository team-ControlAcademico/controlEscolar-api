const { LogAuditoria } = require('../models');
const { paginated, handleSequelizeError } = require('../utils/response');
const { buildQuery } = require('../utils/queryHelper');

exports.index = async (req, res) => {
  try {
    const { page, limit, offset, where, order } = buildQuery(req, {
      searchFields: ['tabla', 'accion'],
      filterFields: ['tabla', 'accion', 'usuario_id', 'registro_id'],
      sortable: ['id', 'created_at', 'tabla', 'accion'],
      defaultOrder: [['created_at', 'DESC']],
      defaultLimit: 25,
    });

    const { rows, count } = await LogAuditoria.findAndCountAll({ where, limit, offset, order });
    return paginated(res, rows, page, limit, count);
  } catch (err) {
    return handleSequelizeError(res, err);
  }
};
