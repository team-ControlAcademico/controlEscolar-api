const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alumno = sequelize.define('Alumno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  matricula: {
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
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  genero: {
    type: DataTypes.ENUM('M', 'F', 'Otro'),
    allowNull: true,
  },
  direccion: {
    type: DataTypes.TEXT,
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
  promedio: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
  },
  estatus: {
    type: DataTypes.ENUM('activo', 'inactivo', 'egresado'),
    defaultValue: 'activo',
  },
  grupo_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  padre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'alumnos',
});

module.exports = Alumno;
