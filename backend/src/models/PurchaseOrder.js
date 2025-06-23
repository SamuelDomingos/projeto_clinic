const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Supplier = require('./Supplier');
const User = require('./User');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Suppliers',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false
  }
});

// Definir associações
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId' });

PurchaseOrder.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PurchaseOrder, { foreignKey: 'userId' });

module.exports = PurchaseOrder; 