const success = (res, data, message = null, statusCode = 200) => {
  const response = { data };
  if (message) response.message = message;
  return res.status(statusCode).json(response);
};

const created = (res, data, message = 'Recurso creado exitosamente.') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Error del servidor.', statusCode = 500) => {
  return res.status(statusCode).json({ message });
};

const notFound = (res, message = 'Recurso no encontrado.') => {
  return error(res, message, 404);
};

const validationError = (res, errors) => {
  return res.status(422).json({ message: 'Error de validacion.', errors });
};

const paginated = (res, data, page, limit, total) => {
  return res.json({
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = { success, created, error, notFound, validationError, paginated };
