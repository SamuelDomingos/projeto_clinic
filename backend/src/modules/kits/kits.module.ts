import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kit } from './entities/kit.entity';
import { KitItem } from './entities/kit-item.entity';
import { KitsService } from './kits.service';
import { KitsController } from './kits.controller';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kit, KitItem]),
    StockMovementsModule,
    ProductsModule,
    AuthModule
  ],
  controllers: [KitsController],
  providers: [KitsService],
  exports: [KitsService],
})
export class KitsModule {}