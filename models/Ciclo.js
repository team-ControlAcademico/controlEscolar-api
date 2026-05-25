const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ciclo = sequelize.define('Ciclo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'ciclos_escolares',
});

module.exports = Ciclo;
