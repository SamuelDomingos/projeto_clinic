import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { Product } from '../products/entities/product.entity';
import { StockLocation } from '../stock-locations/entities/stock-location.entity';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsController } from './stock-movements.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { StockLocationsService } from '../stock-locations/stock-locations.service';
import { StockLocationsModule } from '../stock-locations/stock-locations.module';
import { SuppliersService } from '../suppliers/suppliers.service';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovement, Product, StockLocation, User, Supplier]),
    AuthModule,
    forwardRef(() => StockLocationsModule),
    forwardRef(() => SuppliersModule),
    forwardRef(() => TransactionsModule),
    CategoriesModule,
  ],
  controllers: [StockMovementsController],
  providers: [StockMovementsService, SuppliersService],
  exports: [StockMovementsService],
})
export class StockMovementsModule {} 