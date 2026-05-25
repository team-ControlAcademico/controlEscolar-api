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
  ciclo_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  grado_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  turno_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'grupos',
});

module.exports = Grupo;
