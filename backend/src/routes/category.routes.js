const { Router } = require("express");
const CategoryController = require("../controllers/Category.controller");
const authMiddleware = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas de categorias
router.get("/categories", checkPermission("categories", "read"), CategoryController.index);
router.get("/categories/:id", checkPermission("categories", "read"), CategoryController.show);
router.post("/categories", checkPermission("categories", "create"), CategoryController.store);
router.put("/categories/:id", checkPermission("categories", "update"), CategoryController.update);
router.delete("/categories/:id", checkPermission("categories", "delete"), CategoryController.destroy);

module.exports = router; 