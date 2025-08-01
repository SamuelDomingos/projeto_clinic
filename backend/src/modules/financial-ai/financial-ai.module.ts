import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialAnalysis } from './entities/financial-analysis.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { FinancialAIService } from './financial-ai.service';
import { FinancialAIController } from './financial-ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinancialAnalysis,
      Transaction,
      Invoice
    ])
  ],
  controllers: [FinancialAIController],
  providers: [FinancialAIService],
  exports: [FinancialAIService],
})
export class FinancialAIModule {}