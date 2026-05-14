const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Materia = sequelize.define('Materia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  creditos: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'materias',
});

module.exports = Materia;
