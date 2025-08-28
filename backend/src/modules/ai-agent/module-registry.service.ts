import { Injectable, Type, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Repository, DataSource, EntityMetadata } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ModuleInfo {
  name: string;
  service?: Type<any>;
  controller?: Type<any>;
  entity?: Type<any>;
  repository?: Repository<any>;
  methods: string[];
  endpoints: string[];
  relationships: Array<{ type: string; target: string; property: string }>;
  metadata?: EntityMetadata;
  lastAnalyzed: Date;
}

export interface ProjectStructure {
  modules: Map<string, ModuleInfo>;
  entities: Map<string, EntityMetadata>;
  relationships: Map<string, Array<{ type: string; target: string; property: string }>>;
  apiEndpoints: Map<string, string[]>;
  businessRules: Map<string, any>;
  lastUpdated: Date;
}

@Injectable()
export class ModuleRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ModuleRegistryService.name);
  private registry: Map<string, Type<any>> = new Map();
  private moduleInfos: Map<string, ModuleInfo> = new Map();
  private projectStructure: ProjectStructure;
  private learningCache: Map<string, any> = new Map();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.projectStructure = {
      modules: new Map(),
      entities: new Map(),
      relationships: new Map(),
      apiEndpoints: new Map(),
      businessRules: new Map(),
      lastUpdated: new Date()
    };
  }

  async onModuleInit() {
    await this.discoverAndAnalyzeProject();
    this.logger.log('Sistema de descoberta automática inicializado');
  }

  // Descoberta automática completa do projeto
  async discoverAndAnalyzeProject(): Promise<void> {
    try {
      await this.discoverModules();
      await this.analyzeEntities();
      await this.mapRelationships();
      await this.analyzeBusinessRules();
      await this.cacheProjectKnowledge();
      
      this.projectStructure.lastUpdated = new Date();
      this.logger.log(`Projeto analisado: ${this.moduleInfos.size} módulos descobertos`);
    } catch (error) {
      this.logger.error('Erro na descoberta do projeto:', error);
    }
  }

  // Descoberta automática de módulos
  private async discoverModules(): Promise<void> {
    const controllers = this.discoveryService.getControllers();
    const providers = this.discoveryService.getProviders();

    // Analisar controllers
    for (const controller of controllers) {
      const controllerClass = controller.metatype;
      if (controllerClass && typeof controllerClass === 'function' && controllerClass.prototype) { // Adicionada verificação de tipo mais robusta
        const moduleName = this.extractModuleName(controllerClass.name);
        
        if (moduleName && !this.moduleInfos.has(moduleName)) {
          const moduleInfo = await this.analyzeModule(moduleName, controllerClass as Type<any>);
          this.moduleInfos.set(moduleName, moduleInfo);
        }
      }
    }

    // Analisar services
    for (const provider of providers) {
      if (provider.metatype && provider.metatype.name.endsWith('Service')) {
        const serviceName = provider.metatype.name;
        const moduleName = this.extractModuleName(serviceName);
        
        if (moduleName && this.moduleInfos.has(moduleName)) {
          const moduleInfo = this.moduleInfos.get(moduleName);
          if (moduleInfo) {
            moduleInfo.service = provider.metatype as Type<any>;
            moduleInfo.methods = this.extractServiceMethods(provider.metatype as Type<any>);
          }
        }
      }
    }
  }

  // Análise detalhada de um módulo
  private async analyzeModule(moduleName: string, controllerClass: Type<any>): Promise<ModuleInfo> {
    const endpoints = this.extractEndpoints(controllerClass);
    
    return {
      name: moduleName,
      controller: controllerClass,
      methods: [],
      endpoints: endpoints,
      relationships: [],
      lastAnalyzed: new Date()
    };
  }

  // Análise de entidades do banco de dados
  private async analyzeEntities(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    
    for (const entity of entities) {
      const moduleName = this.extractModuleName(entity.name);
      this.projectStructure.entities.set(entity.name, entity);
      
      if (moduleName && this.moduleInfos.has(moduleName)) {
        const moduleInfo = this.moduleInfos.get(moduleName);
        if (moduleInfo) {
          moduleInfo.entity = entity.target as Type<any>;
          moduleInfo.metadata = entity;
          moduleInfo.repository = this.dataSource.getRepository(entity.target);
        }
      }
    }
  }

  // Mapeamento de relacionamentos entre entidades
  private async mapRelationships(): Promise<void> {
    for (const [entityName, metadata] of this.projectStructure.entities) {
      const relationships: Array<{ type: string; target: string; property: string }> = [];
      
      for (const relation of metadata.relations) {
        relationships.push({
          type: relation.relationType,
          target: relation.inverseEntityMetadata.name,
          property: relation.propertyName
        });
      }
      
      this.projectStructure.relationships.set(entityName, relationships);
    }
  }

  // Análise de regras de negócio
  private async analyzeBusinessRules(): Promise<void> {
    for (const [moduleName, moduleInfo] of this.moduleInfos) {
      const businessRules = {
        validations: this.extractValidationRules(moduleInfo.entity),
        constraints: this.extractConstraints(moduleInfo.metadata),
        workflows: this.extractWorkflows(moduleInfo.service),
        permissions: this.extractPermissions(moduleInfo.controller)
      };
      
      this.projectStructure.businessRules.set(moduleName, businessRules);
    }
  }

  // Cache do conhecimento do projeto para aprendizado contínuo
  private async cacheProjectKnowledge(): Promise<void> {
    const knowledge = {
      structure: this.projectStructure,
      patterns: this.identifyPatterns(),
      commonQueries: this.identifyCommonQueries(),
      optimizations: this.suggestOptimizations(),
      timestamp: new Date()
    };
    
    this.learningCache.set('project_knowledge', knowledge);
  }

  // Identificação de padrões no projeto
  private identifyPatterns(): any {
    return {
      namingConventions: this.analyzeNamingConventions(),
      architecturalPatterns: this.analyzeArchitecturalPatterns(),
      dataPatterns: this.analyzeDataPatterns()
    };
  }

  // Métodos utilitários
  private extractModuleName(className: string): string {
    return className
      .replace(/(Controller|Service|Entity)$/, '')
      .toLowerCase()
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  private extractEndpoints(controllerClass: Type<any>): string[] {
    const endpoints: string[] = [];
    const prototype = controllerClass.prototype;
    
    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      if (typeof prototype[methodName] === 'function' && methodName !== 'constructor') {
        const metadata = this.reflector.get('path', prototype[methodName]);
        if (metadata) {
          endpoints.push(`${methodName}: ${metadata}`);
        }
      }
    }
    
    return endpoints;
  }

  private extractServiceMethods(serviceClass: Type<any>): string[] {
    const methods: string[] = [];
    const prototype = serviceClass.prototype;
    
    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      if (typeof prototype[methodName] === 'function' && methodName !== 'constructor') {
        methods.push(methodName);
      }
    }
    
    return methods;
  }

  private extractValidationRules(entity?: Type<any>): any[] {
    if (!entity) return [];
    
    // Implementar extração de validações usando class-validator
    return [];
  }

  private extractConstraints(metadata?: EntityMetadata): any[] {
    if (!metadata) return [];
    
    return metadata.indices.map(index => ({
      type: 'index',
      columns: index.columns.map(col => col.propertyName),
      unique: index.isUnique
    }));
  }

  private extractWorkflows(service?: Type<any>): any[] {
    // Analisar métodos do service para identificar workflows
    return [];
  }

  private extractPermissions(controller?: Type<any>): any[] {
    // Extrair informações de permissões dos decorators
    return [];
  }

  private analyzeNamingConventions(): any {
    return {
      controllers: 'PascalCase + Controller suffix',
      services: 'PascalCase + Service suffix',
      entities: 'PascalCase + Entity suffix'
    };
  }

  private analyzeArchitecturalPatterns(): any {
    return {
      pattern: 'Modular Architecture',
      orm: 'TypeORM',
      framework: 'NestJS'
    };
  }

  private analyzeDataPatterns(): any {
    const patterns: string[] = [];
    
    for (const [entityName, metadata] of this.projectStructure.entities) {
      if (metadata.columns.some(col => col.propertyName === 'createdAt')) {
        patterns.push('Timestamped entities');
      }
      if (metadata.columns.some(col => col.propertyName === 'id')) {
        patterns.push('Auto-increment IDs');
      }
    }
    
    return [...new Set(patterns)];
  }

  private identifyCommonQueries(): string[] {
    return [
      'findAll with pagination',
      'findById',
      'create',
      'update',
      'delete',
      'findByStatus'
    ];
  }

  private suggestOptimizations(): string[] {
    return [
      'Implement caching for frequently accessed data',
      'Add database indexes for common queries',
      'Use pagination for large datasets',
      'Implement soft deletes where appropriate'
    ];
  }

  // Métodos públicos para o AI Agent
  register(moduleName: string, service: Type<any>) {
    this.registry.set(moduleName, service);
  }

  getService(moduleName: string): Type<any> | undefined {
    return this.registry.get(moduleName);
  }

  getAllModules(): string[] {
    return Array.from(this.moduleInfos.keys());
  }

  getModuleInfo(moduleName: string): ModuleInfo | undefined {
    return this.moduleInfos.get(moduleName);
  }

  getProjectStructure(): ProjectStructure {
    return this.projectStructure;
  }

  getProjectKnowledge(): any {
    return this.learningCache.get('project_knowledge');
  }

  // Consulta inteligente baseada em linguagem natural
  async queryProject(question: string): Promise<any> {
    const knowledge = this.getProjectKnowledge();
    
    // Implementar lógica de processamento de linguagem natural
    // para responder perguntas sobre o projeto
    
    return {
      question,
      answer: 'Resposta baseada no conhecimento do projeto',
      confidence: 0.85,
      sources: ['module_analysis', 'entity_relationships']
    };
  }

  // Atualização contínua do conhecimento
  async updateKnowledge(): Promise<void> {
    await this.discoverAndAnalyzeProject();
  }

  // Adicionar métodos ausentes
  analyzeProjectComplexity(): any {
    const moduleCount = this.moduleInfos.size;
    const entityCount = this.projectStructure.entities.size;
    const totalEndpoints = Array.from(this.moduleInfos.values())
      .reduce((total, module) => total + module.endpoints.length, 0);
    
    let complexityLevel = 'baixa';
    if (moduleCount > 10 || entityCount > 15) complexityLevel = 'alta';
    else if (moduleCount > 5 || entityCount > 8) complexityLevel = 'média';
    
    return {
      complexity: complexityLevel,
      metrics: {
        modules: moduleCount,
        entities: entityCount,
        endpoints: totalEndpoints,
        relationships: this.projectStructure.relationships.size
      },
      recommendations: this.getComplexityRecommendations(complexityLevel),
      lastAnalyzed: new Date()
    };
  }

  extractBusinessRules(): any {
    const rules = new Map();
    
    for (const [moduleName, businessRules] of this.projectStructure.businessRules) {
      rules.set(moduleName, {
        validations: businessRules.validations || [],
        constraints: businessRules.constraints || [],
        workflows: businessRules.workflows || [],
        permissions: businessRules.permissions || []
      });
    }
    
    return {
      rules: Object.fromEntries(rules),
      summary: {
        totalModules: rules.size,
        hasValidations: Array.from(rules.values()).some(r => r.validations.length > 0),
        hasConstraints: Array.from(rules.values()).some(r => r.constraints.length > 0),
        hasWorkflows: Array.from(rules.values()).some(r => r.workflows.length > 0)
      },
      extractedAt: new Date()
    };
  }

  private getComplexityRecommendations(level: string): string[] {
    switch (level) {
      case 'alta':
        return [
          'Considere dividir módulos grandes em submódulos',
          'Implemente cache para melhorar performance',
          'Use padrões de design para reduzir acoplamento',
          'Considere microserviços para módulos independentes'
        ];
      case 'média':
        return [
          'Monitore o crescimento da complexidade',
          'Mantenha documentação atualizada',
          'Implemente testes automatizados'
        ];
      default:
        return [
          'Projeto com complexidade gerenciável',
          'Continue seguindo boas práticas de desenvolvimento'
        ];
    }
  }
}