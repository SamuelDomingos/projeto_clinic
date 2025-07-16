import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolService } from './entities/protocol-service.entity';
import { Protocol } from '../protocols/entities/protocol.entity';
import { Service } from '../services/entities/service.entity';
import { ProtocolServicesService } from './protocol-services.service';
import { ProtocolServicesController } from './protocol-services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProtocolService, Protocol, Service])],
  controllers: [ProtocolServicesController],
  providers: [ProtocolServicesService],
  exports: [ProtocolServicesService],
})
export class ProtocolServicesModule {} 