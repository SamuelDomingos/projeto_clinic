import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Permission]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard, JwtModule, TypeOrmModule],
})
export class AuthModule {} 