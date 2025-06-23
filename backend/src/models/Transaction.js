const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Transaction extends Model {
  static associate(models) {
    // Associação com o usuário que criou a transação
    Transaction.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });

    // Associação com o usuário que atualizou a transação
    Transaction.belongsTo(models.User, {
      foreignKey: "updatedBy",
      as: "updater",
    });

    // Associação com o método de pagamento
    Transaction.belongsTo(models.PaymentMethod, {
      foreignKey: "paymentMethodId",
      as: "paymentMethod",
    });

    // Associação com a categoria
    Transaction.belongsTo(models.Category, {
      foreignKey: "category",
      as: "categoryData",
      targetKey: "id"
    });

    // Optional associations based on relatedEntityType
    Transaction.belongsTo(models.Invoice, {
      foreignKey: "relatedEntityId",
      constraints: false,
      scope: {
        relatedEntityType: "invoice",
      },
    });

    Transaction.belongsTo(models.Product, {
      foreignKey: "relatedEntityId",
      constraints: false,
      scope: {
        relatedEntityType: "product",
      },
    });

    Transaction.belongsTo(models.Patient, {
      foreignKey: "relatedEntityId",
      constraints: false,
      scope: {
        relatedEntityType: "patient",
      },
    });

    Transaction.belongsTo(models.Protocol, {
      foreignKey: "relatedEntityId",
      constraints: false,
      scope: {
        relatedEntityType: "protocol",
      },
    });
  }
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("revenue", "expense"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    paymentMethodId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "paymentmethods",
        key: "id",
      },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    installments: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    installmentNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "transactions",
    timestamps: true,
  }
);

module.exports = Transaction; 