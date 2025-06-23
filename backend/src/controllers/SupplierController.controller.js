const { Op } = require('sequelize');
const Supplier = require('../models/Supplier');
const { validationResult } = require('express-validator');

class SupplierController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const supplier = await Supplier.create(req.body);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Error creating supplier' });
    }
  }

  static async read(req, res) {
    try {
      const supplier = await Supplier.findByPk(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching supplier' });
    }
  }

  static async update(req, res) {
    try {
      const supplier = await Supplier.findByPk(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      await supplier.update(req.body);
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Error updating supplier' });
    }
  }

  static async delete(req, res) {
    try {
      const supplier = await Supplier.findByPk(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      await supplier.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting supplier' });
    }
  }

  static async searchSuppliers(req, res) {
    try {
      const { name, category, status } = req.query;
      const where = {};

      if (name) {
        where.name = { [Op.like]: `%${name}%` };
      }

      if (category) {
        where.category = category;
      }

      if (status) {
        where.status = status;
      }

      const suppliers = await Supplier.findAll({ where });
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: 'Error searching suppliers' });
    }
  }

  static async updateSupplierStatus(req, res) {
    try {
      const { status } = req.body;
      const supplier = await Supplier.findByPk(req.params.id);

      if (!supplier) {
        return res.status(404).json({ error: 'Supplier not found' });
      }

      await supplier.update({ status });
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: 'Error updating supplier status' });
    }
  }
}

module.exports = SupplierController; 