import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementAIController } from './management-ai.controller';
import { FinancialAIModule } from '../financial-ai/financial-ai.module';
import { SchedulingAIModule } from '../scheduling-ai/scheduling-ai.module';
import { InventoryAIModule } from '../inventory-ai/inventory-ai.module';
import { PatientAIModule } from '../patient-ai/patient-ai.module';
import { BusinessIntelligenceModule } from '../business-intelligence/business-intelligence.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FinancialAIModule,
    SchedulingAIModule,
    InventoryAIModule,
    PatientAIModule,
    BusinessIntelligenceModule,
    AuthModule,
  ],
  controllers: [ManagementAIController],
})
export class ManagementAIModule {}