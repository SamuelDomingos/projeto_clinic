const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/PermissionController.controller');
const checkPermission = require('../middleware/checkPermission');

// Listar todas as permissões
router.get('/permissions', checkPermission(), PermissionController.list);

// Criar nova permissão
router.post('/permissions', checkPermission(), PermissionController.create);

// Atualizar permissão
router.put('/permissions/:id', checkPermission(), PermissionController.update);

// Desativar permissão
router.delete('/permissions/:id', checkPermission(), PermissionController.deactivate);

// Limpar cache de permissões
router.post('/permissions/clear-cache', checkPermission(), PermissionController.clearCache);

module.exports = router; 