// models/referralRequest.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const ReferralRequest = sequelize.define('ReferralRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jobId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resumeUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'referred', 'rejected'),
    defaultValue: 'pending'
  },
  referred_by_user: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true
});

User.hasMany(ReferralRequest, { foreignKey: 'userId' });
ReferralRequest.belongsTo(User, { foreignKey: 'userId' });

module.exports = ReferralRequest;
