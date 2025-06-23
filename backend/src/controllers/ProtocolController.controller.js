const { Protocol, Service, ProtocolService } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const ProtocolController = {
  // Create a new Protocol
  async createProtocol(req, res) {
    try {
      const { name, totalPrice, services } = req.body;

      if (!name || !totalPrice || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ error: 'Name, total price, and at least one service are required.' });
      }

      const protocol = await Protocol.create({ name, totalPrice });

      // Add services to the protocol
      for (const serviceData of services) {
        const { name, type, requiresScheduling, numberOfSessions, requiresIntervalControl } = serviceData;
        
        // Create the service first
        const service = await Service.create({
          name,
          type,
          requiresScheduling: requiresScheduling || false
        });

        // Then create the protocol service
        await ProtocolService.create({
          protocolId: protocol.id,
          serviceId: service.id,
          numberOfSessions: numberOfSessions || 1,
          requiresIntervalControl: requiresIntervalControl || false
        });
      }

      const newProtocol = await Protocol.findByPk(protocol.id, {
        include: [{
          model: ProtocolService,
          include: [Service]
        }]
      });

      // Transform the response to match the frontend expectations
      const transformedProtocol = {
        ...newProtocol.toJSON(),
        services: newProtocol.ProtocolServices.map(ps => ({
          id: ps.Service.id,
          name: ps.Service.name,
          type: ps.Service.type,
          requiresScheduling: ps.Service.requiresScheduling,
          numberOfSessions: ps.numberOfSessions,
          requiresIntervalControl: ps.requiresIntervalControl
        }))
      };

      res.status(201).json(transformedProtocol);
    } catch (error) {
      console.error('Error creating protocol:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all Protocols
  async getAllProtocols(req, res) {
    try {
      const protocols = await Protocol.findAll({
        include: [{
          model: ProtocolService,
          include: [Service]
        }]
      });

      // Transform the response to match the frontend expectations
      const transformedProtocols = protocols.map(protocol => ({
        ...protocol.toJSON(),
        services: protocol.ProtocolServices.map(ps => ({
          id: ps.Service.id,
          name: ps.Service.name,
          type: ps.Service.type,
          requiresScheduling: ps.Service.requiresScheduling,
          numberOfSessions: ps.numberOfSessions,
          requiresIntervalControl: ps.requiresIntervalControl
        }))
      }));

      res.status(200).json(transformedProtocols);
    } catch (error) {
      console.error('Error fetching protocols:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get Protocol by ID
  async getProtocolById(req, res) {
    try {
      const { id } = req.params;
      const protocol = await Protocol.findByPk(id, {
        include: [{
          model: ProtocolService,
          include: [Service]
        }]
      });
      if (!protocol) {
        return res.status(404).json({ error: 'Protocol not found' });
      }

      // Transform the response to match the frontend expectations
      const transformedProtocol = {
        ...protocol.toJSON(),
        services: protocol.ProtocolServices.map(ps => ({
          id: ps.Service.id,
          name: ps.Service.name,
          type: ps.Service.type,
          requiresScheduling: ps.Service.requiresScheduling,
          numberOfSessions: ps.numberOfSessions,
          requiresIntervalControl: ps.requiresIntervalControl
        }))
      };

      res.status(200).json(transformedProtocol);
    } catch (error) {
      console.error('Error fetching protocol by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update a Protocol
  async updateProtocol(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { name, totalPrice, services } = req.body;

      const protocol = await Protocol.findByPk(id, { transaction });
      if (!protocol) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Protocolo não encontrado' });
      }

      // Atualiza os dados básicos do protocolo
      await protocol.update({ name, totalPrice }, { transaction });

      if (Array.isArray(services)) {
        // Primeiro, remove as associações ProtocolService existentes
        await ProtocolService.destroy({
          where: { protocolId: protocol.id },
          transaction
        });

        // Depois, remove os serviços antigos que não estão mais sendo usados
        const oldServices = await Service.findAll({
          include: [{
            model: ProtocolService,
            where: { protocolId: protocol.id }
          }],
          transaction
        });

        for (const service of oldServices) {
          // Verifica se o serviço não está sendo usado em outros protocolos
          const otherProtocols = await ProtocolService.count({
            where: {
              serviceId: service.id,
              protocolId: { [Op.ne]: protocol.id }
            },
            transaction
          });

          if (otherProtocols === 0) {
            await service.destroy({ transaction });
          }
        }

        // Agora cria os novos serviços e associações
        for (const serviceData of services) {
          const { name, type, requiresScheduling, numberOfSessions, requiresIntervalControl } = serviceData;
          
          // Cria o novo serviço
          const service = await Service.create({
            name,
            type,
            requiresScheduling: requiresScheduling || false
          }, { transaction });

          // Cria a associação com o protocolo
          await ProtocolService.create({
            protocolId: protocol.id,
            serviceId: service.id,
            numberOfSessions: numberOfSessions || 1,
            requiresIntervalControl: requiresIntervalControl || false
          }, { transaction });
        }
      }

      // Busca o protocolo atualizado com todos os dados
      const updatedProtocol = await Protocol.findByPk(protocol.id, {
        include: [{
          model: ProtocolService,
          include: [Service]
        }],
        transaction
      });

      // Transforma a resposta para o formato esperado pelo frontend
      const transformedProtocol = {
        ...updatedProtocol.toJSON(),
        services: updatedProtocol.ProtocolServices.map(ps => ({
          id: ps.Service.id,
          name: ps.Service.name,
          type: ps.Service.type,
          requiresScheduling: ps.Service.requiresScheduling,
          numberOfSessions: ps.numberOfSessions,
          requiresIntervalControl: ps.requiresIntervalControl
        }))
      };

      await transaction.commit();
      res.status(200).json(transformedProtocol);
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating protocol:', error);
      res.status(500).json({ 
        error: 'Erro ao atualizar protocolo',
        details: error.message 
      });
    }
  },

  // Delete a Protocol
  async deleteProtocol(req, res) {
    try {
      const { id } = req.params;
      const protocol = await Protocol.findByPk(id);
      if (!protocol) {
        return res.status(404).json({ error: 'Protocol not found' });
      }

      // Delete associated ProtocolServices and their Services
      const protocolServices = await ProtocolService.findAll({
        where: { protocolId: protocol.id },
        include: [Service]
      });

      for (const ps of protocolServices) {
        await ps.Service.destroy();
        await ps.destroy();
      }

      await protocol.destroy();
      res.status(204).send(); // No Content
    } catch (error) {
      console.error('Error deleting protocol:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = ProtocolController; 