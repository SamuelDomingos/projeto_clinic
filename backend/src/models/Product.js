const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Supplier = require('./Supplier');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unidade'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  minimumStock: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  specifications: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true
});

// Modelo para localizações de estoque
const StockLocation = sequelize.define('StockLocation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

// Modelo para movimentações de estoque
const StockMovement = sequelize.define('StockMovement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  supplierId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Suppliers',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('in', 'out', 'transfer'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

// Definir associações
Product.hasMany(StockLocation, { foreignKey: 'productId' });
StockLocation.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(StockMovement, { foreignKey: 'productId' });
StockMovement.belongsTo(Product, { foreignKey: 'productId' });

StockMovement.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(StockMovement, { foreignKey: 'supplierId' });

module.exports = {
  Product,
  StockLocation,
  StockMovement
};