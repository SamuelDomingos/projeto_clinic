import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async list(role?: string) {
    const validRoles = ['admin', 'health_professional', 'receptionist', 'financial', 'scheduling', 'common'];
    const where = role ? { role: role as any } : {};
    return this.userRepository.find({
      where,
      select: { password: false } as any,
    });
  }

  async getById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: { password: false } as any,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async create(data: Partial<User>) {
    const { name, email, password, permissions, role } = data;
    
    if (!email || !password || !name) {
      throw new BadRequestException('Nome, email e senha são obrigatórios');
    }
    
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new BadRequestException('Email já cadastrado');
    
    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      permissions: permissions || [],
      role: role || 'common',
      status: 'active',
    });
    await this.userRepository.save(user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, data: Partial<User>) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Atualiza campos simples
    user.name = data.name || user.name;
    user.email = data.email || user.email;
    user.status = data.status || user.status;
    user.role = data.role || user.role;

    // Atualiza senha se fornecida
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    // Atualiza permissions (many-to-many)
    if (data.permissions) {
      if (typeof data.permissions === 'string') {
        try {
          user.permissions = JSON.parse(data.permissions);
        } catch {
          user.permissions = [];
        }
      } else {
        user.permissions = data.permissions;
      }
    }

    await this.userRepository.save(user);
    return this.getById(id);
  }

  async delete(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.userRepository.delete(id);
    return { message: 'Usuário excluído permanentemente' };
  }

  async search(query: string) {
    return this.userRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      select: { password: false } as any,
    });
  }

  findAll(query?: any) {
    return this.list(query?.role);
  }

  findOne(id: string) {
    return this.getById(id);
  }

  remove(id: string) {
    return this.delete(id);
  }
} 