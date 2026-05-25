const success = (res, data, message = null, statusCode = 200) => {
  const response = { success: true, data };
  if (message) response.message = message;
  return res.status(statusCode).json(response);
};

const created = (res, data, message = 'Recurso creado exitosamente.') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Error del servidor.', statusCode = 500, details = null) => {
  const response = { success: false, message };
  if (details) response.errors = details;
  return res.status(statusCode).json(response);
};

const notFound = (res, message = 'Recurso no encontrado.') => {
  return error(res, message, 404);
};

const conflict = (res, message = 'Conflicto. El recurso ya existe o tiene dependencias.') => {
  return error(res, message, 409);
};

const validationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Error de validacion.',
    errors,
  });
};

const paginated = (res, data, page, limit, total, message = null) => {
  const body = {
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  if (message) body.message = message;
  return res.json(body);
};

const handleSequelizeError = (res, err) => {
  if (err && err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors ? err.errors.map(e => e.path).join(', ') : 'campo';
    return conflict(res, `Valor duplicado en: ${fields}.`);
  }
  if (err && err.name === 'SequelizeForeignKeyConstraintError') {
    return conflict(res, 'Violacion de llave foranea. El recurso esta en uso o referencia un valor inexistente.');
  }
  if (err && err.name === 'SequelizeValidationError') {
    const details = err.errors.map(e => ({ field: e.path, message: e.message }));
    return validationError(res, details);
  }
  return error(res, err && err.message ? err.message : 'Error del servidor.');
};

module.exports = {
  success,
  created,
  error,
  notFound,
  conflict,
  validationError,
  paginated,
  handleSequelizeError,
};
