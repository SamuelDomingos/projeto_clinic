import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Token não fornecido');
    const [, token] = authHeader.split(' ');
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const user = await this.userRepository.findOne({ where: { id: decoded.id } });
      console.log('AuthGuard decoded:', decoded);
      console.log('AuthGuard user:', user);
      if (!user) throw new UnauthorizedException('Usuário não encontrado');
      if (user.status !== 'active') throw new UnauthorizedException('Usuário inativo');
      request.user = { id: user.id, email: user.email, permissions: user.permissions };
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token inválido');
    }
  }
} 