import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Category } from '../categories/entities/category.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { StockMovementsModule } from '../stock-movements/stock-movements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Category, PaymentMethod]),
    AuthModule,
    forwardRef(() => StockMovementsModule),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {} 