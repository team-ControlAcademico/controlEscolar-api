const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Maestro = sequelize.define('Maestro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  num_empleado: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido_paterno: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apellido_materno: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  especialidad: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'maestros',
});

module.exports = Maestro;
