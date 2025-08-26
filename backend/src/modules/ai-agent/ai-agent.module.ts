import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { AIAgentService } from './ai-agent.service';
import { AIAgentController } from './ai-agent.controller';
import { ModuleRegistryService } from './module-registry.service';

@Module({
  imports: [DiscoveryModule],
  controllers: [AIAgentController],
  providers: [AIAgentService, ModuleRegistryService],
  exports: [AIAgentService, ModuleRegistryService],
})
export class AIAgentModule {
  static forRoot(): DynamicModule {
    return {
      module: AIAgentModule,
      providers: [AIAgentService, ModuleRegistryService],
      exports: [AIAgentService, ModuleRegistryService],
    };
  }

  static registerAsync(options: any): DynamicModule {
    return {
      module: AIAgentModule,
      imports: options.imports || [],
      providers: [
        AIAgentService,
        ModuleRegistryService,
        ...(options.providers || []),
      ],
      exports: [AIAgentService, ModuleRegistryService],
    };
  }
}