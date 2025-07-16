import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
// Importar todos os módulos reais
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ProtocolsModule } from './modules/protocols/protocols.module';
import { ServicesModule } from './modules/services/services.module';
import { ProtocolServicesModule } from './modules/protocol-services/protocol-services.module';
import { PatientProtocolsModule } from './modules/patient-protocols/patient-protocols.module';
import { PatientServiceSessionsModule } from './modules/patient-service-sessions/patient-service-sessions.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ProductsModule } from './modules/products/products.module';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';
import { StockLocationsModule } from './modules/stock-locations/stock-locations.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { QuestionnaireCategoriesModule } from './modules/questionnaire-categories/questionnaire-categories.module';
import { QuestionnairesModule } from './modules/questionnaires/questionnaires.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { EmployeeResponsesModule } from './modules/employee-responses/employee-responses.module';
import { ChatHistoriesModule } from './modules/chat-histories/chat-histories.module';
import { IAAnalysesModule } from './modules/ia-analyses/ia-analyses.module';
import { VideosModule } from './modules/videos/videos.module';
import { VideoWatchesModule } from './modules/video-watches/video-watches.module';
// Importar módulos de agenda
import { ScheduleConfigModule } from './modules/schedule/config/schedule-config.module';
import { ScheduleTypeModule } from './modules/schedule/types/schedule-type.module';
import { ScheduleHolidayModule } from './modules/schedule/holidays/schedule-holiday.module';
import { ScheduleEventModule } from './modules/schedule/events/schedule-event.module';
import { ScheduleRuleModule } from './modules/schedule/rules/schedule-rule.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UsersModule,
    PatientsModule,
    MedicalRecordsModule,
    AppointmentsModule,
    ProtocolsModule,
    ServicesModule,
    ProtocolServicesModule,
    PatientProtocolsModule,
    PatientServiceSessionsModule,
    InvoicesModule,
    PaymentMethodsModule,
    CategoriesModule,
    SuppliersModule,
    TransactionsModule,
    PermissionsModule,
    ProductsModule,
    StockMovementsModule,
    StockLocationsModule,
    PurchaseOrdersModule,
    QuestionnaireCategoriesModule,
    QuestionnairesModule,
    QuestionsModule,
    EmployeeResponsesModule,
    ChatHistoriesModule,
    IAAnalysesModule,
    VideosModule,
    VideoWatchesModule,
    // Módulos de agenda
    ScheduleConfigModule,
    ScheduleTypeModule,
    ScheduleHolidayModule,
    ScheduleEventModule,
    ScheduleRuleModule,
  ],
})
export class AppModule {}
