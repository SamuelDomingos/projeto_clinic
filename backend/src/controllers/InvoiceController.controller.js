const { Invoice, InvoiceItem, InvoicePayment, Patient, Protocol, Service, PaymentMethod } = require("../models");
const { Op } = require("sequelize");

// Função auxiliar para gerar número sequencial
async function generateInvoiceNumber(type) {
  const prefix = type === 'budget' ? 'ORÇ' : 'FAT';
  const lastInvoice = await Invoice.findOne({
    where: {
      number: {
        [Op.like]: `${prefix}-%`
      }
    },
    order: [['number', 'DESC']]
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.number.split('-')[1]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
}

// Criar orçamento/fatura
exports.createInvoice = async (req, res) => {
  const transaction = await Invoice.sequelize.transaction();
  
  try {
    const {
      type,
      patientId,
      protocolId,
      performedBy,
      notes,
      items,
      payments,
      discount,
      discountType
    } = req.body;

    // Gerar número sequencial
    const number = await generateInvoiceNumber(type);

    // Calcular subtotal e total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountValue = discountType === 'percentage' 
      ? (subtotal * discount / 100) 
      : discount;
    const total = subtotal - discountValue;

    // Criar fatura/orçamento
    const invoice = await Invoice.create({
      number,
      type,
      status: type === 'budget' ? 'pending' : 'invoiced',
      date: new Date(),
      performedBy,
      notes,
      subtotal,
      discount: discountValue,
      discountType,
      total,
      patientId,
      protocolId
    }, { transaction });

    // Criar itens
    const invoiceItems = await Promise.all(
      items.map(item => 
        InvoiceItem.create({
          invoiceId: invoice.id,
          protocolId: item.protocolId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        }, { transaction })
      )
    );

    // Se for fatura, criar pagamentos
    if (type === 'invoice' && payments && payments.length > 0) {
      const invoicePayments = await Promise.all(
        payments.map(payment =>
          InvoicePayment.create({
            invoiceId: invoice.id,
            paymentMethodId: payment.paymentMethodId,
            dueDate: payment.dueDate,
            controlNumber: payment.controlNumber,
            description: payment.description,
            installments: payment.installments,
            installmentValue: payment.installmentValue,
            totalValue: payment.totalValue
          }, { transaction })
        )
      );
    }

    await transaction.commit();

    // Buscar fatura com relacionamentos
    const createdInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Protocol, as: 'protocol' },
        { 
          model: InvoiceItem, 
          as: 'items',
          include: [{ model: Protocol, as: 'protocol' }]
        },
        {
          model: InvoicePayment,
          as: 'payments',
          include: [{ model: PaymentMethod, as: 'paymentMethod' }]
        }
      ]
    });

    res.status(201).json(createdInvoice);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

// Listar todas as faturas/orçamentos
exports.listInvoices = async (req, res) => {
  try {
    const { type, status, search } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.number = { [Op.like]: `%${search}%` };
    }

    const invoices = await Invoice.findAll({
      where,
      include: [
        { model: Patient, as: 'patient' },
        { model: Protocol, as: 'protocol' },
        { 
          model: InvoiceItem, 
          as: 'items',
          include: [{ model: Protocol, as: 'protocol' }]
        },
        {
          model: InvoicePayment,
          as: 'payments',
          include: [{ model: PaymentMethod, as: 'paymentMethod' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error listing invoices:', error);
    res.status(500).json({ error: error.message });
  }
};

// Buscar fatura/orçamento por ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Protocol, as: 'protocol' },
        { 
          model: InvoiceItem, 
          as: 'items',
          include: [{ model: Protocol, as: 'protocol' }]
        },
        {
          model: InvoicePayment,
          as: 'payments',
          include: [{ model: PaymentMethod, as: 'paymentMethod' }]
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

// Atualizar fatura/orçamento
exports.updateInvoice = async (req, res) => {
  const transaction = await Invoice.sequelize.transaction();
  
  try {
    const {
      status,
      performedBy,
      notes,
      items,
      payments,
      discount,
      discountType
    } = req.body;

    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Atualizar dados básicos
    await invoice.update({
      status,
      performedBy,
      notes,
      discount,
      discountType
    }, { transaction });

    // Recalcular totais
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountValue = discountType === 'percentage' 
      ? (subtotal * discount / 100) 
      : discount;
    const total = subtotal - discountValue;

    await invoice.update({
      subtotal,
      discount: discountValue,
      total
    }, { transaction });

    // Atualizar itens
    await InvoiceItem.destroy({ 
      where: { invoiceId: invoice.id },
      transaction 
    });

    const invoiceItems = await Promise.all(
      items.map(item => 
        InvoiceItem.create({
          invoiceId: invoice.id,
          protocolId: item.protocolId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        }, { transaction })
      )
    );

    // Se for fatura, atualizar pagamentos
    if (invoice.type === 'invoice' && payments) {
      await InvoicePayment.destroy({ 
        where: { invoiceId: invoice.id },
        transaction 
      });

      if (payments.length > 0) {
        const invoicePayments = await Promise.all(
          payments.map(payment =>
            InvoicePayment.create({
              invoiceId: invoice.id,
              paymentMethodId: payment.paymentMethodId,
              dueDate: payment.dueDate,
              controlNumber: payment.controlNumber,
              description: payment.description,
              installments: payment.installments,
              installmentValue: payment.installmentValue,
              totalValue: payment.totalValue
            }, { transaction })
          )
        );

        // Verificar se o total dos pagamentos é igual ou maior que o total da fatura
        const totalPayments = payments.reduce((sum, payment) => sum + payment.totalValue, 0);
        if (totalPayments >= total) {
          await invoice.update({ status: 'paid' }, { transaction });
        }
      }
    }

    await transaction.commit();

    // Buscar fatura atualizada
    const updatedInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Protocol, as: 'protocol' },
        { 
          model: InvoiceItem, 
          as: 'items',
          include: [{ model: Protocol, as: 'protocol' }]
        },
        {
          model: InvoicePayment,
          as: 'payments',
          include: [{ model: PaymentMethod, as: 'paymentMethod' }]
        }
      ]
    });

    res.json(updatedInvoice);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

// Converter orçamento em fatura
exports.convertToInvoice = async (req, res) => {
  const transaction = await Invoice.sequelize.transaction();
  
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.type !== 'budget') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Only budgets can be converted to invoices' });
    }

    // Gerar novo número de fatura
    const newNumber = await generateInvoiceNumber('invoice');

    // Atualizar fatura
    await invoice.update({
      type: 'invoice',
      status: 'invoiced',
      number: newNumber
    }, { transaction });

    await transaction.commit();

    // Buscar fatura atualizada
    const updatedInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Protocol, as: 'protocol' },
        { 
          model: InvoiceItem, 
          as: 'items',
          include: [{ model: Protocol, as: 'protocol' }]
        },
        {
          model: InvoicePayment,
          as: 'payments',
          include: [{ model: PaymentMethod, as: 'paymentMethod' }]
        }
      ]
    });

    res.json(updatedInvoice);
  } catch (error) {
    await transaction.rollback();
    console.error('Error converting to invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

// Excluir fatura/orçamento
exports.deleteInvoice = async (req, res) => {
  const transaction = await Invoice.sequelize.transaction();
  
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Excluir itens e pagamentos primeiro
    await InvoiceItem.destroy({ 
      where: { invoiceId: invoice.id },
      transaction 
    });
    
    await InvoicePayment.destroy({ 
      where: { invoiceId: invoice.id },
      transaction 
    });

    // Excluir fatura
    await invoice.destroy({ transaction });

    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: error.message });
  }
}; 