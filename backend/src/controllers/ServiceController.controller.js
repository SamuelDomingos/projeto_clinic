const { Service } = require('../models');
const { Op } = require('sequelize');

const ServiceController = {
  // Create a new Service
  async createService(req, res) {
    try {
      const { name, type, requiresScheduling } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required.' });
      }

      const service = await Service.create({ name, type, requiresScheduling });
      res.status(201).json(service);
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all Services
  async getAllServices(req, res) {
    try {
      const services = await Service.findAll();
      res.status(200).json(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get Service by ID
  async getServiceById(req, res) {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }
      res.status(200).json(service);
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update a Service
  async updateService(req, res) {
    try {
      const { id } = req.params;
      const { name, type, requiresScheduling } = req.body;

      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      await service.update({ name, type, requiresScheduling });
      res.status(200).json(service);
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a Service
  async deleteService(req, res) {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      await service.destroy();
      res.status(204).send(); // No Content
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = ServiceController; 