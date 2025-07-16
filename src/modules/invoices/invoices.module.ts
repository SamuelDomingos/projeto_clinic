import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Patient } from '../patients/entities/patient.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoicePayment } from './entities/invoice-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, InvoicePayment, Patient])],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {} 