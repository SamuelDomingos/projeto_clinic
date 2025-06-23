const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/InvoiceController.controller");
const auth = require("../middleware/auth");

// Todas as rotas requerem autenticação
router.use(auth);

// Rotas para faturas/orçamentos
router.post("/", invoiceController.createInvoice);
router.get("/", invoiceController.listInvoices);
router.get("/:id", invoiceController.getInvoiceById);
router.put("/:id", invoiceController.updateInvoice);
router.delete("/:id", invoiceController.deleteInvoice);

// Rota específica para converter orçamento em fatura
router.post("/:id/convert", invoiceController.convertToInvoice);

module.exports = router; 