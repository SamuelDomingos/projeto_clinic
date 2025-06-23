const express = require('express');
const router = express.Router();
const PatientServiceSessionController = require('../controllers/PatientServiceSessionController.controller');

// Create a new patient service session
router.post('/', PatientServiceSessionController.createPatientServiceSession);

// Get all patient service sessions
router.get('/', PatientServiceSessionController.getAllPatientServiceSessions);

// Get a single patient service session by ID
router.get('/:id', PatientServiceSessionController.getPatientServiceSessionById);

// Update a patient service session by ID
router.put('/:id', PatientServiceSessionController.updatePatientServiceSession);

// Delete a patient service session by ID
router.delete('/:id', PatientServiceSessionController.deletePatientServiceSession);

module.exports = router; 