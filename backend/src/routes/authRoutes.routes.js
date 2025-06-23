const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { body } = require('express-validator');

// Validation middleware
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('permissions').isArray().withMessage('Permissions must be an array')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Rotas públicas
router.post('/login', loginValidation, AuthController.login);
router.post('/register', registerValidation, AuthController.register);

// Rotas protegidas
router.get('/me', 
  auth, 
  checkPermission('auth', 'read'),
  AuthController.me
);

module.exports = router; 