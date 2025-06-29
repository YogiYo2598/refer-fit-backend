// models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('fresher', 'experienced'),
    defaultValue: 'experienced'
  },
  role: {
    type: DataTypes.ENUM('requester', 'referrer'),
    defaultValue: 'requester'
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = User;
