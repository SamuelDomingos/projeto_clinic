const express = require("express");
const router = express.Router();
const PaymentMethodController = require("../controllers/PaymentMethodController.controller");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");

// Rotas específicas primeiro
router.get("/type/:type", auth, checkPermission('payment-methods', 'read'), PaymentMethodController.getByType);

// Rotas de CRUD
router.post("/", auth, checkPermission('payment-methods', 'create'), PaymentMethodController.create);
router.get("/", auth, checkPermission('payment-methods', 'read'), PaymentMethodController.list);

// Rotas com parâmetros por último
router.get("/:id", auth, checkPermission('payment-methods', 'read'), PaymentMethodController.getById);
router.put("/:id", auth, checkPermission('payment-methods', 'update'), PaymentMethodController.update);
router.delete("/:id", auth, checkPermission('payment-methods', 'delete'), PaymentMethodController.delete);

module.exports = router; 