const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogAuditoria = sequelize.define('LogAuditoria', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  tabla: { type: DataTypes.STRING(100), allowNull: false },
  registro_id: { type: DataTypes.STRING(100), allowNull: true },
  accion: { type: DataTypes.STRING(20), allowNull: false },
  datos_anteriores: { type: DataTypes.JSONB, allowNull: true },
  datos_nuevos: { type: DataTypes.JSONB, allowNull: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  ip: { type: DataTypes.STRING(64), allowNull: true },
}, {
  tableName: 'log_auditoria',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = LogAuditoria;
