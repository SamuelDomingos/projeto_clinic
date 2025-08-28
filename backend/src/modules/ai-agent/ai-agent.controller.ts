import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { AIAgentService, RelatorioResultado, DatabaseQuery } from './ai-agent.service';
import { ModuleRegistryService, ProjectStructure, ModuleInfo } from './module-registry.service';

@Controller('ai-agent')
export class AIAgentController {
  constructor(
    private readonly aiAgentService: AIAgentService,
    private readonly moduleRegistry: ModuleRegistryService,
  ) {}

  @Post('otimizar')
  async otimizar(@Body() data: { task: string; context?: any }) {
    return this.aiAgentService.otimizarProcessos(data.task, data.context);
  }

  @Post('query/natural-language')
  async naturalLanguageQuery(@Body() data: { query: string }) {
    return this.aiAgentService.processNaturalLanguageQuery(data.query);
  }

  @Post('reports/intelligent')
  async generateIntelligentReport(@Body() data: { request: string }): Promise<RelatorioResultado> {
    return this.aiAgentService.generateIntelligentReport(data.request);
  }

  @Post('reports/custom')
  async generateCustomReport(@Body() config: any): Promise<RelatorioResultado> {
    return this.aiAgentService.gerarRelatorio(config);
  }

  @Post('daily-assistant')
  async dailyAssistant(@Body() data: { action: string; context?: any }) {
    return this.aiAgentService.dailyIntelligentAssistant(data.action, data.context);
  }

  @Post('alerts')
  async createAlert(@Body() rule: any) {
    return this.aiAgentService.createAlertRule(rule);
  }

  @Get('alerts')
  async getAlerts() {
    return this.aiAgentService.getActiveAlerts();
  }

  @Delete('alerts/:id')
  async deleteAlert(@Param('id') id: string) {
    return this.aiAgentService.deleteAlertRule(id);
  }

  @Post('query/dynamic')
  async dynamicQuery(@Body() query: DatabaseQuery) {
    return this.aiAgentService.executeDynamicQuery(query);
  }

  @Get('project/structure')
  async getProjectStructure(): Promise<ProjectStructure> {
    return this.moduleRegistry.getProjectStructure();
  }

  @Get('project/knowledge')
  async getProjectKnowledge() {
    return this.moduleRegistry.getProjectKnowledge();
  }

  @Get('project/analysis')
  async getProjectAnalysis() {
    return this.moduleRegistry.analyzeProjectComplexity();
  }

  @Get('project/business-rules')
  async getBusinessRules() {
    return this.moduleRegistry.extractBusinessRules();
  }

  @Get('modules/:name')
  async getModuleInfo(@Param('name') name: string): Promise<ModuleInfo | undefined> {
    return this.moduleRegistry.getModuleInfo(name);
  }
}