const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const auth = require('../config/auth');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('admin', 'maestro', 'alumno', 'padre'),
    defaultValue: 'alumno',
    allowNull: false,
  },
  reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
  },
  reset_token_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, auth.bcryptRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, auth.bcryptRounds);
      }
    },
  },
});

User.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
