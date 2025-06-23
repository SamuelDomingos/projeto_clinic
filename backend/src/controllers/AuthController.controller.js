const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log('Tentativa de login para:', email);

      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log('Usuário não encontrado:', email);
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Senha inválida' });
      }

      // Lista de permissões necessárias
      const requiredPermissions = [
        'auth:read',
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'suppliers:read',
        'patients:read',
        'appointments:read',
        'medical-records:read',
        'settings:read'
      ];

      // Garantir que o usuário tenha todas as permissões necessárias
      let userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
      
      // Adicionar permissões que faltam
      requiredPermissions.forEach(permission => {
        if (!userPermissions.includes(permission)) {
          userPermissions.push(permission);
        }
      });

      // Atualizar as permissões do usuário se necessário
      if (userPermissions.length !== user.permissions.length) {
        await user.update({ permissions: userPermissions });
      }

      // Atualizar último login
      await user.update({ lastLogin: new Date() });

      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          permissions: userPermissions
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Retornar dados do usuário sem a senha
      const userData = user.toJSON();
      delete userData.password;

      res.json({
        user: userData,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Verificar se usuário já existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Criar novo usuário com permissões básicas
      const permissions = [
        'auth:read',
        'users:read',
        'suppliers:read',
        'patients:read',
        'appointments:read',
        'settings:read',
        'medical-records:read',
        'medical-records:create',
        'medical-records:update',
        'medical-records:delete'
      ];

      const user = await User.create({
        name,
        email,
        password,
        permissions: JSON.stringify(permissions),
        status: 'active'
      });

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          permissions: permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Retornar todos os dados do usuário exceto a senha
      const { password: _, ...userData } = user.toJSON();
      userData.permissions = permissions; // Garantir que as permissões sejam um array no retorno

      return res.status(201).json({
        user: userData,
        token
      });
    } catch (error) {
      console.error('Error in register:', error);
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }

  async me(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Retornar todos os dados do usuário exceto a senha
      const { password: _, ...userData } = user.toJSON();
      
      // Garantir que as permissões sejam um array
      userData.permissions = Array.isArray(user.permissions) 
        ? user.permissions 
        : typeof user.permissions === 'string' 
          ? JSON.parse(user.permissions) 
          : [];

      return res.json(userData);
    } catch (error) {
      console.error('Error in me:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
  }
}

module.exports = new AuthController(); 