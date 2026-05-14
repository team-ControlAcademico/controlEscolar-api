const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asistencia = sequelize.define('Asistencia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('presente', 'ausente', 'justificado', 'retardo'),
    allowNull: false,
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'asistencias',
  indexes: [
    {
      unique: true,
      fields: ['alumno_id', 'fecha'],
    },
  ],
});

module.exports = Asistencia;
