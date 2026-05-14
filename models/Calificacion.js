const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Calificacion = sequelize.define('Calificacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  materia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maestro_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parcial: {
    type: DataTypes.ENUM('1', '2', '3', 'final'),
    allowNull: false,
  },
  calificacion: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: { min: 0, max: 10 },
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'calificaciones',
  indexes: [
    {
      unique: true,
      fields: ['alumno_id', 'materia_id', 'parcial'],
    },
  ],
});

module.exports = Calificacion;
