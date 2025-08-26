import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Patient } from '../patients/entities/patient.entity';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoicePayment } from './entities/invoice-payment.entity';
import { PatientProtocolsModule } from '../patient-protocols/patient-protocols.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoriesModule } from '../categories/categories.module'; // Adicionar esta linha

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem, InvoicePayment, Patient]),
    PatientProtocolsModule,
    TransactionsModule,
    CategoriesModule, // Adicionar esta linha
  ],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    { provide: 'SERVICE_FATURAMENTO', useExisting: InvoicesService }, // Adicione esta linha
  ],
  exports: [InvoicesService, 'SERVICE_FATURAMENTO'], // Adicione 'SERVICE_FATURAMENTO' aqui
})
export class InvoicesModule {}