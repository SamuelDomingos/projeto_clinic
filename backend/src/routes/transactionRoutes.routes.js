const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/TransactionController.controller");
const authMiddleware = require("../middleware/auth");
const permissionMiddleware = require("../middleware/checkPermission");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all transactions with filters
router.get(
  "/",
  permissionMiddleware("view_transactions"),
  TransactionController.getAll
);

// Get financial summary
router.get(
  "/summary",
  permissionMiddleware("view_transactions"),
  TransactionController.getFinancialSummary
);

// Get a single transaction
router.get(
  "/:id",
  permissionMiddleware("view_transactions"),
  TransactionController.getById
);

// Create a new transaction
router.post(
  "/",
  permissionMiddleware("create_transactions"),
  TransactionController.create
);

// Update a transaction
router.put(
  "/:id",
  permissionMiddleware("edit_transactions"),
  TransactionController.update
);

// Delete a transaction
router.delete(
  "/:id",
  permissionMiddleware("delete_transactions"),
  TransactionController.delete
);

module.exports = router; 