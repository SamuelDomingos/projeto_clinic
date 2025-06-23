const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const User = require('../models/User');

// Rotas protegidas
router.get('/', auth, checkPermission('users', 'read'), userController.list);
router.get('/search', auth, checkPermission('users', 'read'), userController.search);
router.get('/:id', auth, checkPermission('users', 'read'), userController.getById);
router.post('/', auth, checkPermission('users', 'create'), userController.create);
router.put('/:id', auth, checkPermission('users', 'update'), userController.update);
router.delete('/:id', auth, checkPermission('users', 'delete'), userController.delete);

// Rota para buscar todos os médicos
router.get('/doctors', auth, async (req, res) => {
  try {
    const doctors = await User.getDoctors();
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Erro ao buscar médicos' });
  }
});

module.exports = router; 