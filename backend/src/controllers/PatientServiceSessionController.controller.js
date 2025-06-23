const { PatientServiceSession, PatientProtocol, ProtocolService, Service, Appointment, Patient, User } = require('../models');
const { Op } = require('sequelize');

const PatientServiceSessionController = {
  // Create a new PatientServiceSession
  async createPatientServiceSession(req, res) {
    try {
      const { patientProtocolId, protocolServiceId, observations, nextAllowedDate, sessionDate } = req.body;

      if (!patientProtocolId || !protocolServiceId || !sessionDate) {
        return res.status(400).json({ error: 'Patient Protocol ID, Protocol Service ID, and Session Date are required.' });
      }

      const patientProtocol = await PatientProtocol.findByPk(patientProtocolId);
      if (!patientProtocol) {
        return res.status(404).json({ error: 'Patient Protocol not found.' });
      }

      const protocolService = await ProtocolService.findByPk(protocolServiceId, {
        include: [Service]
      });
      if (!protocolService) {
        return res.status(404).json({ error: 'Protocol Service not found.' });
      }

      if (protocolService.Service.requiresScheduling) {
        // For services requiring scheduling, ensure an appointment exists or handle it.
        // This part might need to be integrated with your existing appointment system.
        // For simplicity, let's assume it's handled elsewhere or created separately for now.
      }

      // For injection services, check nextAllowedDate
      if (protocolService.Service.type === 'injection') {
        if (!nextAllowedDate) {
          return res.status(400).json({ error: 'nextAllowedDate is required for injection services.' });
        }
        // Add logic to check if sessionDate is after nextAllowedDate if needed
      }

      const patientServiceSession = await PatientServiceSession.create({
        patientProtocolId,
        protocolServiceId,
        sessionDate,
        observations,
        nextAllowedDate
      });

      res.status(201).json(patientServiceSession);
    } catch (error) {
      console.error('Error creating patient service session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all PatientServiceSessions
  async getAllPatientServiceSessions(req, res) {
    try {
      const patientServiceSessions = await PatientServiceSession.findAll({
        include: [
          { model: PatientProtocol, include: [Patient, Protocol] },
          { model: ProtocolService, include: [Service] }
        ]
      });
      res.status(200).json(patientServiceSessions);
    } catch (error) {
      console.error('Error fetching patient service sessions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get PatientServiceSession by ID
  async getPatientServiceSessionById(req, res) {
    try {
      const { id } = req.params;
      const patientServiceSession = await PatientServiceSession.findByPk(id, {
        include: [
          { model: PatientProtocol, include: [Patient, Protocol] },
          { model: ProtocolService, include: [Service] }
        ]
      });
      if (!patientServiceSession) {
        return res.status(404).json({ error: 'Patient Service Session not found' });
      }
      res.status(200).json(patientServiceSession);
    } catch (error) {
      console.error('Error fetching patient service session by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update a PatientServiceSession
  async updatePatientServiceSession(req, res) {
    try {
      const { id } = req.params;
      const { sessionDate, observations, nextAllowedDate, status } = req.body;

      const patientServiceSession = await PatientServiceSession.findByPk(id);
      if (!patientServiceSession) {
        return res.status(404).json({ error: 'Patient Service Session not found' });
      }

      await patientServiceSession.update({ sessionDate, observations, nextAllowedDate, status });
      res.status(200).json(patientServiceSession);
    } catch (error) {
      console.error('Error updating patient service session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a PatientServiceSession
  async deletePatientServiceSession(req, res) {
    try {
      const { id } = req.params;
      const patientServiceSession = await PatientServiceSession.findByPk(id);
      if (!patientServiceSession) {
        return res.status(404).json({ error: 'Patient Service Session not found' });
      }

      await patientServiceSession.destroy();
      res.status(204).send(); // No Content
    } catch (error) {
      console.error('Error deleting patient service session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = PatientServiceSessionController; 