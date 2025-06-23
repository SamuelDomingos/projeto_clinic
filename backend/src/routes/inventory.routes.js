const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController.controller');
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');
const { body } = require('express-validator');

// Validações
const productValidation = [
  body('name').notEmpty().withMessage('Nome do produto é obrigatório'),
  body('unit').notEmpty().withMessage('Unidade é obrigatória'),
  body('category').notEmpty().withMessage('Categoria é obrigatória'),
  body('minimumStock').isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número positivo')
];

const stockValidation = [
  body('productId').isUUID().withMessage('Produto inválido'),
  body('location').notEmpty().withMessage('Localização é obrigatória'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('sku').notEmpty().withMessage('SKU é obrigatório'),
  body('supplierId').optional().isUUID().withMessage('Fornecedor inválido')
];

const transferValidation = [
  body('productId').isUUID().withMessage('Produto inválido'),
  body('fromLocation').notEmpty().withMessage('Localização de origem é obrigatória'),
  body('toLocation').notEmpty().withMessage('Localização de destino é obrigatória'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  body('reason').notEmpty().withMessage('Motivo é obrigatório'),
  body('sku').notEmpty().withMessage('SKU é obrigatório')
];

// Criar novo produto
router.post('/products', 
  auth, 
  checkPermission('inventory', 'create'),
  productValidation,
  InventoryController.createProduct
);

// Listar produtos com estoque
router.get('/products', 
  auth, 
  checkPermission('inventory', 'read'),
  InventoryController.listProducts
);

// Adicionar estoque
router.post('/stock/add', 
  auth, 
  checkPermission('inventory', 'create'),
  stockValidation,
  InventoryController.addStock
);

// Remover estoque
router.post('/stock/remove', 
  auth, 
  checkPermission('inventory', 'update'),
  [
    body('productId').isUUID().withMessage('Produto inválido'),
    body('location').notEmpty().withMessage('Localização é obrigatória'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
    body('sku').notEmpty().withMessage('SKU é obrigatório'),
    body('reason').notEmpty().withMessage('Motivo é obrigatório')
  ],
  InventoryController.removeStock
);

// Transferir estoque
router.post('/stock/transfer', 
  auth, 
  checkPermission('inventory', 'update'),
  transferValidation,
  InventoryController.transferStock
);

// Listar movimentações de um produto
router.get('/movements/:productId', 
  auth, 
  checkPermission('inventory', 'read'),
  InventoryController.listMovements
);

// Deletar movimentação
router.delete('/movements/:movementId',
  auth,
  checkPermission('inventory', 'delete'),
  InventoryController.deleteMovement
);

// Atualizar movimentação
router.put('/movements/:movementId',
  auth,
  checkPermission('inventory', 'update'),
  [
    body('quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
    body('location').notEmpty().withMessage('Localização é obrigatória'),
    body('reason').notEmpty().withMessage('Motivo é obrigatório'),
    body('sku').notEmpty().withMessage('SKU é obrigatório'),
    body('supplierId').optional().isUUID().withMessage('Fornecedor inválido')
  ],
  InventoryController.updateMovement
);

module.exports = router; 