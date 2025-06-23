const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// Rotas para agendamentos
router.post('/', 
  auth, 
  checkPermission('appointments', 'create'),
  AppointmentController.create
);

router.get('/', 
  auth, 
  checkPermission('appointments', 'read'),
  AppointmentController.list
);

router.put('/:id', 
  auth, 
  checkPermission('appointments', 'update'),
  AppointmentController.update
);

router.post('/:id/cancel', 
  auth, 
  checkPermission('appointments', 'update'),
  AppointmentController.cancel
);

router.post('/:id/confirm', 
  auth, 
  checkPermission('appointments', 'update'),
  AppointmentController.confirm
);

router.post('/:id/complete', 
  auth, 
  checkPermission('appointments', 'update'),
  AppointmentController.complete
);

module.exports = router; 