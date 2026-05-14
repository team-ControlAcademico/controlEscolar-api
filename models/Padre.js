const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Padre = sequelize.define('Padre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ocupacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'padres',
});

module.exports = Padre;
