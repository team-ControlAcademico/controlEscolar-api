const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/auth');
const { success, created, notFound, error } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const { name, email, password, rol } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return error(res, 'El email ya esta registrado.', 409);
    }

    const user = await User.create({ name, email, password, rol });
    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiry });

    return created(res, { user, token });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return notFound(res, 'Credenciales invalidas.');
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      return error(res, 'Credenciales invalidas.', 401);
    }

    const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiry });

    return success(res, { user, token });
  } catch (err) {
    return error(res, err.message);
  }
};

exports.logout = async (req, res) => {
  return success(res, null, 'Sesion cerrada exitosamente.');
};

exports.me = async (req, res) => {
  return success(res, req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'email'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await req.user.update(updates);
    return success(res, req.user);
  } catch (err) {
    return error(res, err.message);
  }
};
