const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin','user'), defaultValue: 'user' },
  google_id: { type: DataTypes.STRING },
  external_auth: { type: DataTypes.STRING },
  refresh_token: { type: DataTypes.TEXT }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;