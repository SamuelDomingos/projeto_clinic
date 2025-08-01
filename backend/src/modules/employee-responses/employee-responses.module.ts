import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeResponse } from './entities/employee-response.entity';
import { EmployeeResponsesService } from './employee-responses.service';
import { EmployeeResponsesController } from './employee-responses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeResponse])],
  providers: [EmployeeResponsesService],
  controllers: [EmployeeResponsesController],
  exports: [EmployeeResponsesService],
})
export class EmployeeResponsesModule {} 