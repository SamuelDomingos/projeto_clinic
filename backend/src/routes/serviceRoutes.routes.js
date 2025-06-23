const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/ServiceController.controller');

// Get available services (for protocols)
router.get('/available', ServiceController.getAllServices);

// Create a new service
router.post('/', ServiceController.createService);

// Get all services
router.get('/', ServiceController.getAllServices);

// Get a single service by ID
router.get('/:id', ServiceController.getServiceById);

// Update a service by ID
router.put('/:id', ServiceController.updateService);

// Delete a service by ID
router.delete('/:id', ServiceController.deleteService);

module.exports = router; 