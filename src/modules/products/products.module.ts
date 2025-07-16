import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { StockMovement } from '@/modules/stock-movements/entities/stock-movement.entity';
import { StockMovementsModule } from '@/modules/stock-movements/stock-movements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Supplier, StockMovement]),
    StockMovementsModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {} 