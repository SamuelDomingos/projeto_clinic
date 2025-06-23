const Permission = require('../models/Permission');

class PermissionController {
  // Listar todas as permissões
  async list(req, res) {
    try {
      const permissions = await Permission.findAll({
        where: { active: true },
        order: [['path', 'ASC']]
      });

      return res.json(permissions);
    } catch (error) {
      console.error('Error listing permissions:', error);
      return res.status(500).json({ error: 'Erro ao listar permissões' });
    }
  }

  // Criar nova permissão
  async create(req, res) {
    try {
      const { path, method } = req.body;

      if (!path || !method) {
        return res.status(400).json({ error: 'Caminho e método são obrigatórios' });
      }

      const permission = await Permission.create({
        path,
        method: method.toUpperCase()
      });

      return res.status(201).json(permission);
    } catch (error) {
      console.error('Error creating permission:', error);
      return res.status(500).json({ error: 'Erro ao criar permissão' });
    }
  }

  // Atualizar permissão
  async update(req, res) {
    try {
      const { id } = req.params;
      const { path, method } = req.body;

      const permission = await Permission.findByPk(id);
      if (!permission) {
        return res.status(404).json({ error: 'Permissão não encontrada' });
      }

      await permission.update({
        path: path || permission.path,
        method: method ? method.toUpperCase() : permission.method
      });

      return res.json(permission);
    } catch (error) {
      console.error('Error updating permission:', error);
      return res.status(500).json({ error: 'Erro ao atualizar permissão' });
    }
  }

  // Desativar permissão
  async deactivate(req, res) {
    try {
      const { id } = req.params;

      const permission = await Permission.findByPk(id);
      if (!permission) {
        return res.status(404).json({ error: 'Permissão não encontrada' });
      }

      await permission.deactivate();

      return res.json({ message: 'Permissão desativada com sucesso' });
    } catch (error) {
      console.error('Error deactivating permission:', error);
      return res.status(500).json({ error: 'Erro ao desativar permissão' });
    }
  }

  // Limpar cache de permissões
  async clearCache(req, res) {
    try {
      await Permission.clearCache();
      return res.json({ message: 'Cache de permissões limpo com sucesso' });
    } catch (error) {
      console.error('Error clearing permission cache:', error);
      return res.status(500).json({ error: 'Erro ao limpar cache de permissões' });
    }
  }
}

module.exports = new PermissionController(); 