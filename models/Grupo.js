const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grupo = sequelize.define('Grupo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  grado: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seccion: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  aula: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  capacidad: {
    type: DataTypes.INTEGER,
    defaultValue: 40,
  },
}, {
  tableName: 'grupos',
});

module.exports = Grupo;
