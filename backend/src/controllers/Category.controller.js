const Category = require("../models/Category");

class CategoryController {
  // Listar todas as categorias
  async index(req, res) {
    try {
      const categories = await Category.findAll({
        order: [["name", "ASC"]],
      });
      return res.json(categories);
    } catch (error) {
      console.error("Erro ao listar categorias:", error);
      return res.status(500).json({ error: "Erro ao listar categorias" });
    }
  }

  // Buscar categoria por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ error: "Categoria não encontrada" });
      }

      return res.json(category);
    } catch (error) {
      console.error("Erro ao buscar categoria:", error);
      return res.status(500).json({ error: "Erro ao buscar categoria" });
    }
  }

  // Criar nova categoria
  async store(req, res) {
    try {
      const { name, type } = req.body;
      const userId = req.user.id;

      if (!name || !type) {
        return res.status(400).json({ error: "Nome e tipo são obrigatórios" });
      }

      const category = await Category.create({
        name,
        type,
        createdBy: userId,
        updatedBy: userId,
      });

      return res.status(201).json(category);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      return res.status(500).json({ error: "Erro ao criar categoria" });
    }
  }

  // Atualizar categoria
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, type } = req.body;
      const userId = req.user.id;

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ error: "Categoria não encontrada" });
      }

      await category.update({
        name,
        type,
        updatedBy: userId,
      });

      return res.json(category);
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      return res.status(500).json({ error: "Erro ao atualizar categoria" });
    }
  }

  // Excluir categoria
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({ error: "Categoria não encontrada" });
      }

      await category.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      return res.status(500).json({ error: "Erro ao excluir categoria" });
    }
  }
}

module.exports = new CategoryController(); 