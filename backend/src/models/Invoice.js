const { DataTypes } = require("sequelize");
const sequelize = require('../config/database');

const Invoice = sequelize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["budget", "invoice"]],
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "approved", "invoiced", "paid", "cancelled"]],
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    guide: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receiptNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    performedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "fixed",
      validate: {
        isIn: [["fixed", "percentage"]],
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id',
      },
    },
    protocolId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Protocols',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
    tableName: 'invoices'
  }
);

// Modelo para os itens da fatura/orçamento
const InvoiceItem = sequelize.define(
  "InvoiceItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Invoices',
        key: 'id',
      },
    },
    protocolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Protocols',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'invoice_items'
  }
);

// Modelo para os pagamentos da fatura
const InvoicePayment = sequelize.define(
  "InvoicePayment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Invoices',
        key: 'id',
      },
    },
    paymentMethodId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'PaymentMethods',
        key: 'id',
      },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    controlNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    installments: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    installmentValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: 'invoice_payments'
  }
);

module.exports = {
  Invoice,
  InvoiceItem,
  InvoicePayment,
}; 