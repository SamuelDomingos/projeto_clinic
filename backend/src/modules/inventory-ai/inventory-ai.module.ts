import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryPrediction } from './entities/inventory-prediction.entity';
import { Product } from '../products/entities/product.entity';
import { StockMovement } from '../stock-movements/entities/stock-movement.entity';
import { StockLocation } from '../stock-locations/entities/stock-location.entity';
import { InventoryAIService } from './inventory-ai.service';
import { InventoryAIController } from './inventory-ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryPrediction,
      Product,
      StockMovement,
      StockLocation
    ])
  ],
  controllers: [InventoryAIController],
  providers: [InventoryAIService],
  exports: [InventoryAIService],
})
export class InventoryAIModule {}