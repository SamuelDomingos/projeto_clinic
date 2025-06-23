const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { Invoice } = require("../models/Invoice");
const Product = require("../models/Product");
const Patient = require("../models/Patient");
const Protocol = require("../models/Protocol");
const PaymentMethod = require("../models/PaymentMethod");
const { Op, Sequelize } = require("sequelize");
const Category = require("../models/Category");
const sequelize = require("../config/database");
const { StockMovement } = require("../models/Product");

class TransactionController {
  // Create a new transaction
  async create(req, res) {
    try {
      const {
        type,
        description,
        amount,
        dueDate,
        category,
        classification,
        paymentMethod,
        reference,
        controlNumber,
        account,
        notes,
        relatedEntityType,
        relatedEntityId,
        attachments,
        paymentMethodId,
        installments,
        installmentNumber,
        cardBrand,
        cardLastDigits,
        branch,
      } = req.body;

      console.log('Dados recebidos:', {
        type,
        description,
        amount,
        dueDate,
        category,
        branch,
        reference,
        installments,
        installmentNumber,
        createdAt: new Date()
      });

      // Se for um pagamento com maquineta, validar e calcular as taxas
      let feeAmount = 0;
      let netAmount = amount;

      // Tratar datas inválidas do OFX
      let formattedDueDate;
      if (!dueDate || dueDate === '0000-00-00 00:00:00') {
        formattedDueDate = new Date(); // Usa a data atual como fallback
        console.log('Data inválida, usando data atual:', formattedDueDate);
      } else {
        formattedDueDate = new Date(dueDate);
        if (isNaN(formattedDueDate.getTime())) {
          formattedDueDate = new Date(); // Se a data for inválida, usa a data atual
          console.log('Data inválida após parse, usando data atual:', formattedDueDate);
        }
      }

      console.log('Criando transação com data:', formattedDueDate);

      // Criar a transação
      const transaction = await Transaction.create({
        type,
        description,
        amount: netAmount,
        dueDate: formattedDueDate,
        category,
        status: "pending",
        notes,
        relatedEntityType,
        relatedEntityId,
        paymentMethodId: paymentMethodId || null,
        branch: branch || null,
        reference: reference || null,
        installments: installments || null,
        installmentNumber: installmentNumber || null,
        createdBy: req.user.id,
        updatedBy: req.user.id,
      });

      console.log('Transação criada:', transaction);

      return res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get all transactions with filters
  async getAll(req, res) {
    try {
      // Buscar todas as transações existentes
      const { page = 1, limit = 50 } = req.query;
      const { count, rows: existingTransactions } = await Transaction.findAndCountAll({
        attributes: [
          'id', 'type', 'amount', 'description', 'category', 
          'paymentMethodId', 'dueDate', 'status', 'notes', 
          'createdBy', 'updatedBy', 'createdAt', 'updatedAt',
          'relatedEntityType', 'relatedEntityId'
        ],
        order: [["createdAt", "DESC"]],
      });

      // Buscar entradas de estoque
      const stockMovements = await StockMovement.findAll({
        where: {
          type: 'in',
          price: { [Op.gt]: 0 }
        }
      });

      // Transformar entradas de estoque em transações
      const stockTransactions = stockMovements.map(movement => ({
        id: `stock_${movement.id}`,
        type: 'expense',
        amount: movement.price,
        description: `Entrada de estoque: ${movement.reason}`,
        dueDate: movement.createdAt,
        category: 'stock',
        status: 'completed',
        relatedEntityType: 'product',
        relatedEntityId: movement.productId,
        createdBy: movement.userId,
        updatedBy: movement.userId,
        createdAt: movement.createdAt,
        updatedAt: movement.updatedAt
      }));

      // Buscar vendas
      const invoices = await Invoice.findAll({
        where: {
          type: 'invoice',
          status: 'paid'
        }
      });

      // Transformar vendas em transações
      const salesTransactions = invoices.map(invoice => ({
        id: `sale_${invoice.id}`,
        type: 'revenue',
        amount: invoice.total,
        description: `Venda: ${invoice.number}`,
        dueDate: invoice.date,
        category: 'sales',
        status: 'completed',
        relatedEntityType: 'invoice',
        relatedEntityId: invoice.id,
        createdBy: invoice.performedBy,
        updatedBy: invoice.performedBy,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt
      }));

      // Combinar todas as transações
      const allTransactions = [
        ...existingTransactions,
        ...stockTransactions,
        ...salesTransactions
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.json({
        transactions: allTransactions,
        total: allTransactions.length,
        pages: 1,
        currentPage: 1
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get a single transaction by ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findByPk(id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "name", "email"],
          },
          {
            model: User,
            as: "updater",
            attributes: ["id", "name", "email"],
          },
          {
            model: PaymentMethod,
            attributes: ["id", "name", "type", "machineName"],
          },
        ],
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      return res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update a transaction
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        type,
        description,
        amount,
        dueDate,
        category,
        classification,
        paymentMethod,
        reference,
        controlNumber,
        account,
        notes,
        status,
        relatedEntityType,
        relatedEntityId,
        attachments,
        paymentMethodId,
        installments,
        installmentNumber,
        cardBrand,
        cardLastDigits,
      } = req.body;

      const transaction = await Transaction.findByPk(id);

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Se for um pagamento com maquineta, recalcular as taxas
      let feeAmount = transaction.feeAmount;
      let netAmount = transaction.netAmount;

      if (paymentMethodId) {
        const paymentMachine = await PaymentMethod.findByPk(paymentMethodId);
        if (!paymentMachine) {
          return res.status(400).json({ error: "Método de pagamento não encontrado" });
        }

        if (paymentMethod === "credit_card") {
          const creditFees = paymentMachine.creditFees;
          const fee = creditFees[installments] || creditFees[1];
          feeAmount = (amount * fee) / 100;
          netAmount = amount - feeAmount;
        } else if (paymentMethod === "debit_card") {
          feeAmount = (amount * paymentMachine.debitFee) / 100;
          netAmount = amount - feeAmount;
        }
      }

      await transaction.update({
        type,
        description,
        amount,
        dueDate,
        category,
        classification,
        paymentMethod,
        reference,
        controlNumber,
        account,
        notes,
        status,
        relatedEntityType,
        relatedEntityId,
        attachments,
        paymentMethodId,
        installments,
        installmentNumber,
        feeAmount,
        netAmount,
        cardBrand,
        cardLastDigits,
        updatedBy: req.user.id,
      });

      // Se for relacionado a uma fatura, atualizar o status
      if (relatedEntityType === "invoice" && relatedEntityId) {
        const invoice = await Invoice.findByPk(relatedEntityId);
        if (invoice) {
          const totalPaid = await Transaction.sum("amount", {
            where: {
              relatedEntityType: "invoice",
              relatedEntityId: invoice.id,
              status: "completed",
            },
          });

          if (totalPaid >= invoice.totalAmount) {
            await invoice.update({ status: "paid" });
          } else if (totalPaid > 0) {
            await invoice.update({ status: "partial" });
          } else {
            await invoice.update({ status: "pending" });
          }
        }
      }

      return res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Delete a transaction
  async delete(req, res) {
    try {
      const { id } = req.params;
      const { deleteAll } = req.query;

      const transaction = await Transaction.findByPk(id);

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Se for uma transação recorrente/parcelada e deleteAll for true
      if (deleteAll === 'true' && transaction.reference) {
        // Deletar todas as transações com o mesmo reference
        await Transaction.destroy({
          where: {
            reference: transaction.reference
          }
        });
      } else {
        // Deletar apenas a transação específica
        await transaction.destroy();
      }

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get financial summary
  async getFinancialSummary(req, res) {
    try {
      const { startDate, endDate, paymentMethodId } = req.query;
      const where = {};

      if (startDate && endDate) {
        where.dueDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }
      if (paymentMethodId) {
        where.paymentMethodId = paymentMethodId;
      }

      // Buscar transações regulares
      const [revenue, expenses, pendingRevenue, pendingExpenses] = await Promise.all([
        // Total revenue
        Transaction.sum("amount", {
          where: { ...where, type: "revenue", status: "completed" },
        }),
        // Total expenses
        Transaction.sum("amount", {
          where: { ...where, type: "expense", status: "completed" },
        }),
        // Pending revenue
        Transaction.sum("amount", {
          where: { ...where, type: "revenue", status: "pending" },
        }),
        // Pending expenses
        Transaction.sum("amount", {
          where: { ...where, type: "expense", status: "pending" },
        }),
      ]);

      // Buscar vendas (invoices) pagas
      const salesWhere = {
        type: 'invoice',
        status: 'paid'
      };

      if (startDate && endDate) {
        salesWhere.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const salesRevenue = await Invoice.sum("total", {
        where: salesWhere
      });

      // Buscar entradas de estoque
      const stockWhere = {
        type: 'in',
        price: { [Op.gt]: 0 }
      };

      if (startDate && endDate) {
        stockWhere.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Calcular o total das movimentações de estoque
      const stockMovements = await StockMovement.findAll({
        where: stockWhere,
        attributes: [
          [sequelize.fn('SUM', sequelize.col('price')), 'total']
        ],
        raw: true
      });

      const stockExpenses = stockMovements[0]?.total || 0;

      const summary = {
        revenue: (revenue || 0) + (salesRevenue || 0),
        expenses: (expenses || 0) + (stockExpenses || 0),
        balance: ((revenue || 0) + (salesRevenue || 0)) - ((expenses || 0) + (stockExpenses || 0)),
        pendingRevenue: pendingRevenue || 0,
        pendingExpenses: pendingExpenses || 0,
        pendingBalance: (pendingRevenue || 0) - (pendingExpenses || 0),
        totalFees: 0, // Implementar cálculo de taxas se necessário
      };

      return res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new TransactionController(); 