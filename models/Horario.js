const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Horario = sequelize.define('Horario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  materia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maestro_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  grupo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dia_semana: {
    type: DataTypes.ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'),
    allowNull: false,
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  aula: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'horarios',
  indexes: [
    {
      unique: true,
      fields: ['maestro_id', 'dia_semana', 'hora_inicio'],
    },
    {
      unique: true,
      fields: ['grupo_id', 'dia_semana', 'hora_inicio'],
    },
  ],
});

module.exports = Horario;
