const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const { User } = require('../models');

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
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalido o expirado.' });
  }
};

module.exports = authenticate;
