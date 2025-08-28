import { Module, DynamicModule } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AIAgentController } from './ai-agent.controller';
import { AIAgentService } from './ai-agent.service';
import { ModuleRegistryService } from './module-registry.service';
import { ReportModule } from '../report/report.module';

@Module({})
export class AIAgentModule {
  static forRoot(): DynamicModule {
    return {
      module: AIAgentModule,
      imports: [
        DiscoveryModule,
        TypeOrmModule.forFeature([]),
        ScheduleModule.forRoot(),
        ReportModule,
      ],
      controllers: [AIAgentController],
      providers: [AIAgentService, ModuleRegistryService],
      exports: [AIAgentService, ModuleRegistryService],
    };
  }

  static registerAsync(options: any): DynamicModule {
    return {
      module: AIAgentModule,
      imports: [
        DiscoveryModule,
        TypeOrmModule.forFeature([]),
        ScheduleModule.forRoot(),
        ReportModule,
      ],
      controllers: [AIAgentController],
      providers: [
        AIAgentService,
        ModuleRegistryService,
        {
          provide: 'AI_AGENT_OPTIONS',
          useValue: options,
        },
      ],
      exports: [AIAgentService, ModuleRegistryService],
    };
  }
}