const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grado = sequelize.define('Grado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  nivel: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'grados',
});

module.exports = Grado;
