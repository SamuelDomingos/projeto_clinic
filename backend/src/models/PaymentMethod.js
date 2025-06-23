const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class PaymentMethod extends Model {
  static associate(models) {
    // Associação com transações
    PaymentMethod.hasMany(models.Transaction, {
      foreignKey: "paymentMethodId",
      as: "transactions",
    });
  }
}

PaymentMethod.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("cash", "credit_card", "debit_card", "bank_transfer", "pix", "check"),
      allowNull: false,
    },
    personType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    beneficiaryId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    beneficiaryType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    machineName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    debitTerm: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    firstInstallmentTerm: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    otherInstallmentsTerm: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    maxInstallments: {
      type: DataTypes.INTEGER,
      defaultValue: 12,
    },
    anticipationTerm: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    acceptedBrands: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue('acceptedBrands');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('acceptedBrands', JSON.stringify(value));
      }
    },
    debitFee: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    creditFees: {
      type: DataTypes.JSON,
      defaultValue: {},
      get() {
        const rawValue = this.getDataValue('creditFees');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('creditFees', JSON.stringify(value));
      }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    }
  },
  {
    sequelize,
    modelName: "PaymentMethod",
    tableName: "paymentmethods",
    timestamps: true,
  }
);

module.exports = PaymentMethod; 