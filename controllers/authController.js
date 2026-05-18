const crypto = require('crypto');
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
    const token = jwt.sign({ id: user.id, rol: user.rol }, config.jwtSecret, { expiresIn: config.jwtExpiry });

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
      return error(res, 'Credenciales invalidas.', 401);
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      return error(res, 'Credenciales invalidas.', 401);
    }

    const token = jwt.sign({ id: user.id, rol: user.rol }, config.jwtSecret, { expiresIn: config.jwtExpiry });

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

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Respuesta genérica para no revelar si el email existe
      return success(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await user.update({
      reset_token: hashedToken,
      reset_token_expires_at: expiresAt,
    });

    // En producción este token se enviaría por email.
    // En desarrollo lo retornamos directamente para facilitar pruebas.
    return success(res, { token: rawToken, expiresAt }, 'Token de restablecimiento generado.');
  } catch (err) {
    return error(res, err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        reset_token: hashedToken,
      },
    });

    if (!user || !user.reset_token_expires_at || user.reset_token_expires_at < new Date()) {
      return error(res, 'Token invalido o expirado.', 400);
    }

    await user.update({
      password,
      reset_token: null,
      reset_token_expires_at: null,
    });

    return success(res, null, 'Contraseña restablecida exitosamente.');
  } catch (err) {
    return error(res, err.message);
  }
};
