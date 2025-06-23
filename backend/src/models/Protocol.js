const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Protocol = sequelize.define('Protocol', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  timestamps: true
});

module.exports = Protocol; 