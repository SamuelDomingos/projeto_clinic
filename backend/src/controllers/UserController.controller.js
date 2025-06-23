const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class UserController {
  async list(req, res) {
    try {
      const { role } = req.query;
      const where = {};
      
      if (role) {
        where.role = role;
      }

      const users = await User.findAll({
        where,
        attributes: { exclude: ['password'] }
      });

      return res.json(users);
    } catch (error) {
      console.error('Error listing users:', error);
      return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  async create(req, res) {
    try {
      const { name, email, password, permissions, role } = req.body;
      console.log('Criando usuário:', { name, email, permissions, role });

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log('Email já cadastrado:', email);
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const user = await User.create({
        name,
        email,
        password,
        permissions: permissions || [],
        role: role || 'common',
        status: 'active'
      });

      console.log('Usuário criado com sucesso:', {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      });

      const { password: _, ...userWithoutPassword } = user.toJSON();
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password, permissions, status, role } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const updateData = {
        name: name || user.name,
        email: email || user.email,
        status: status || user.status,
        permissions: permissions || user.permissions,
        role: role || user.role
      };

      if (password) {
        updateData.password = password;
      }

      if (typeof updateData.permissions === 'string') {
        try {
          updateData.permissions = JSON.parse(updateData.permissions);
        } catch (e) {
          updateData.permissions = [updateData.permissions];
        }
      }

      await user.update(updateData);

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await user.destroy();
      return res.json({ message: 'Usuário excluído permanentemente' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  }

  async search(req, res) {
    try {
      const { query } = req.query;
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } }
          ]
        },
        attributes: { exclude: ['password'] }
      });
      res.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }
}

module.exports = new UserController(); 