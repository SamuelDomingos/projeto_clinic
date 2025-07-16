import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockLocation } from './entities/stock-location.entity';
import { StockLocationsService } from './stock-locations.service';
import { StockLocationsController } from './stock-locations.controller';
import { StockMovementsService } from '../stock-movements/stock-movements.service';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockLocation, StockMovement]),
    forwardRef(() => StockMovementsModule),
    forwardRef(() => SuppliersModule),
    forwardRef(() => TransactionsModule),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [StockLocationsController],
  providers: [StockLocationsService, StockMovementsService],
  exports: [StockLocationsService],
})
export class StockLocationsModule {} 