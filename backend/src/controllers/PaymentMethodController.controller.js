const PaymentMethod = require("../models/PaymentMethod");
const User = require("../models/User");
const Supplier = require("../models/Supplier");

class PaymentMethodController {
  // Listar todos os métodos de pagamento
  async list(req, res) {
    try {
      const paymentMethods = await PaymentMethod.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"],
            required: false,
          },
          {
            model: Supplier,
            as: "supplier",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      });
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar método de pagamento por ID
  async getById(req, res) {
    try {
      const paymentMethod = await PaymentMethod.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"],
            required: false,
          },
          {
            model: Supplier,
            as: "supplier",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      });

      if (!paymentMethod) {
        return res.status(404).json({ error: "Método de pagamento não encontrado" });
      }

      res.json(paymentMethod);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Criar novo método de pagamento
  async create(req, res) {
    try {
      const {
        name,
        type,
        personType,
        beneficiaryId,
        machineName,
        debitTerm,
        firstInstallmentTerm,
        otherInstallmentsTerm,
        maxInstallments,
        anticipationTerm,
        acceptedBrands,
        debitFee,
        creditFees,
      } = req.body;

      // Validar beneficiário
      const beneficiaryType = personType === "pf" ? "user" : "supplier";
      const beneficiary = beneficiaryType === "user"
        ? await User.findByPk(beneficiaryId)
        : await Supplier.findByPk(beneficiaryId);

      if (!beneficiary) {
        return res.status(400).json({ error: "Beneficiário não encontrado" });
      }

      const paymentMethod = await PaymentMethod.create({
        name,
        type,
        personType,
        beneficiaryId,
        beneficiaryType,
        machineName,
        debitTerm,
        firstInstallmentTerm,
        otherInstallmentsTerm,
        maxInstallments,
        anticipationTerm,
        acceptedBrands,
        debitFee,
        creditFees,
        status: "active",
      });

      res.status(201).json(paymentMethod);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar método de pagamento
  async update(req, res) {
    try {
      const paymentMethod = await PaymentMethod.findByPk(req.params.id);

      if (!paymentMethod) {
        return res.status(404).json({ error: "Método de pagamento não encontrado" });
      }

      const {
        name,
        type,
        personType,
        beneficiaryId,
        machineName,
        debitTerm,
        firstInstallmentTerm,
        otherInstallmentsTerm,
        maxInstallments,
        anticipationTerm,
        acceptedBrands,
        debitFee,
        creditFees,
        status,
      } = req.body;

      // Se o beneficiário mudou, validar o novo
      if (beneficiaryId && beneficiaryId !== paymentMethod.beneficiaryId) {
        const beneficiaryType = personType === "pf" ? "user" : "supplier";
        const beneficiary = beneficiaryType === "user"
          ? await User.findByPk(beneficiaryId)
          : await Supplier.findByPk(beneficiaryId);

        if (!beneficiary) {
          return res.status(400).json({ error: "Beneficiário não encontrado" });
        }
      }

      await paymentMethod.update({
        name,
        type,
        personType,
        beneficiaryId,
        beneficiaryType: personType === "pf" ? "user" : "supplier",
        machineName,
        debitTerm,
        firstInstallmentTerm,
        otherInstallmentsTerm,
        maxInstallments,
        anticipationTerm,
        acceptedBrands,
        debitFee,
        creditFees,
        status,
      });

      res.json(paymentMethod);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Deletar método de pagamento
  async delete(req, res) {
    try {
      const paymentMethod = await PaymentMethod.findByPk(req.params.id);

      if (!paymentMethod) {
        return res.status(404).json({ error: "Método de pagamento não encontrado" });
      }

      await paymentMethod.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar métodos de pagamento por tipo
  async getByType(req, res) {
    try {
      const { type } = req.params;
      const paymentMethods = await PaymentMethod.findAll({
        where: { type, status: "active" },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name"],
            required: false,
          },
          {
            model: Supplier,
            as: "supplier",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      });
      res.json(paymentMethods);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PaymentMethodController(); 