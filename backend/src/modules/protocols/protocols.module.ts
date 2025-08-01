import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Protocol } from './entities/protocol.entity';
import { ProtocolsService } from './protocols.service';
import { ProtocolsController } from './protocols.controller';
import { ProtocolService as ProtocolServiceEntity } from '../protocol-services/entities/protocol-service.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Protocol, ProtocolServiceEntity, Service]),
  ],
  controllers: [ProtocolsController],
  providers: [ProtocolsService],
  exports: [ProtocolsService],
})
export class ProtocolsModule {} 