const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const { User } = require('../models');
const { sequelize } = require('../config/database');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autenticado. Por favor inicie sesion.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }
    req.user = user;
    try {
      await sequelize.query(`SELECT set_config('app.current_user_id', :uid, false)`, {
        replacements: { uid: String(user.id) },
      });
    } catch (_) {
      // best-effort: do not block auth if audit context cannot be set
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalido o expirado.' });
  }
};

module.exports = authenticate;
