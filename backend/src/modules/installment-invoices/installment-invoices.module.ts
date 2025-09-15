import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallmentInvoicesService } from './installment-invoices.service';
import { InstallmentInvoicesController } from './installment-invoices.controller';
import { InstallmentInvoice } from './entities/installment-invoice.entity';
import { PaymentHistory } from './entities/payment-history.entity';
import { Protocol } from '../protocols/entities/protocol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstallmentInvoice,
      PaymentHistory,
      Protocol
    ])
  ],
  controllers: [InstallmentInvoicesController],
  providers: [InstallmentInvoicesService],
  exports: [InstallmentInvoicesService]
})
export class InstallmentInvoicesModule {}