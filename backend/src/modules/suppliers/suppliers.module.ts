import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {} 