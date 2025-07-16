import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Permission } from '../permissions/entities/permission.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new UnauthorizedException('Senha inválida');
    
    // Inicializar permissões do usuário de forma segura
    let userPermissions: any[] = [];
    if (user.permissions && Array.isArray(user.permissions)) {
      userPermissions = user.permissions;
    }
    
    // Atualizar último login
    await this.userRepository.update(user.id, { lastLogin: new Date() });
    
    // Gerar token
    const token = this.jwtService.sign(
      { id: user.id, email: user.email, permissions: userPermissions },
      { secret: process.env.JWT_SECRET || 'default_secret', expiresIn: '24h' }
    );
    
    const { password: _, ...userData } = user;
    return { 
      user: { 
        ...userData, 
        permissions: userPermissions 
      }, 
      token 
    };
  }

  async register(data: { name: string; email: string; password: string; permissions?: Permission[] }) {
    const { name, email, password, permissions } = data;
    
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new BadRequestException('Email já cadastrado');
    
    // Fazer hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      permissions: permissions || [],
      status: 'active',
    });
    await this.userRepository.save(user);
    const token = this.jwtService.sign(
      { id: user.id, email: user.email, permissions },
      { secret: process.env.JWT_SECRET || 'default_secret', expiresIn: '24h' }
    );
    const { password: _, ...userData } = user;
    return { user: { ...userData, permissions }, token };
  }

  async me(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const { password: _, ...userData } = user;
    userData.permissions = Array.isArray(user.permissions)
      ? user.permissions
      : typeof user.permissions === 'string'
        ? JSON.parse(user.permissions as any)
        : [];
    return userData;
  }
} 