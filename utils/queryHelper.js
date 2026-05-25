const { Op } = require('sequelize');

const getPagination = (req, defaultLimit = 15, maxLimit = 100) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const rawLimit = parseInt(req.query.limit) || defaultLimit;
  const limit = Math.min(Math.max(rawLimit, 1), maxLimit);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const getSearchClause = (req, fields = []) => {
  const term = (req.query.search || '').trim();
  if (!term || fields.length === 0) return {};
  return {
    [Op.or]: fields.map((field) => ({
      [field]: { [Op.iLike]: `%${term}%` },
    })),
  };
};

const getOrderClause = (req, allowed = [], fallback = [['id', 'ASC']]) => {
  const sortBy = req.query.sort_by || req.query.sortBy;
  const sortDir = (req.query.sort_dir || req.query.sortDir || 'ASC').toUpperCase();
  const dir = sortDir === 'DESC' ? 'DESC' : 'ASC';
  if (sortBy && allowed.includes(sortBy)) {
    return [[sortBy, dir]];
  }
  return fallback;
};

const getFilters = (req, allowed = []) => {
  const where = {};
  for (const field of allowed) {
    if (req.query[field] !== undefined && req.query[field] !== '') {
      where[field] = req.query[field];
    }
  }
  return where;
};

const buildQuery = (req, options = {}) => {
  const {
    searchFields = [],
    filterFields = [],
    sortable = [],
    defaultOrder = [['id', 'ASC']],
    defaultLimit = 15,
    maxLimit = 100,
  } = options;

  const { page, limit, offset } = getPagination(req, defaultLimit, maxLimit);
  const where = {
    ...getFilters(req, filterFields),
    ...getSearchClause(req, searchFields),
  };
  const order = getOrderClause(req, sortable, defaultOrder);
  return { page, limit, offset, where, order };
};

module.exports = {
  getPagination,
  getSearchClause,
  getOrderClause,
  getFilters,
  buildQuery,
};
