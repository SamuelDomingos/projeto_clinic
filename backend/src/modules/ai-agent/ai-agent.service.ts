import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ModuleRegistryService } from './module-registry.service';
import { conversarComIA } from '../../services/groq.service';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

// Interfaces para tipos de relatórios
export interface RelatorioConfig {
  modulo: string;
  tipo: 'analitico' | 'resumido' | 'comparativo' | 'tendencia' | 'personalizado';
  periodo?: {
    inicio: Date;
    fim: Date;
  };
  filtros?: Record<string, any>;
  formato?: 'texto' | 'json' | 'markdown';
  metricas?: string[];
  agrupamento?: string[];
}

export interface RelatorioResultado {
  id: string;
  titulo: string;
  conteudo: string;
  metadados: {
    modulo: string;
    tipo: string;
    dataGeracao: Date;
    totalRegistros: number;
    periodo?: string;
  };
  anexos?: any[];
}

export interface DatabaseQuery {
  module: string;
  entity: string;
  operation?: 'find' | 'count' | 'aggregate';
  conditions?: Record<string, any>;
  joins?: string[];
  groupBy?: string[];
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  limit?: number;
  offset?: number;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  module: string;
  condition: string;
  actions: AlertAction[];
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
}

export interface AlertAction {
  type: 'email' | 'notification' | 'webhook';
  target: string;
  message: string;
}

  interface AIResponse {
    interpretation: string;
    query: any;
    explanation: string;
  }

@Injectable()
export class AIAgentService {
  private readonly logger = new Logger(AIAgentService.name);
  private alertRules: Map<string, AlertRule> = new Map();
  private queryCache: Map<string, { data: any; timestamp: Date; ttl: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutos

  constructor(
    private moduleRef: ModuleRef,
    private registry: ModuleRegistryService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.initializeDefaultAlertRules();
  }

  private initializeDefaultAlertRules(): void {
    // Implementar regras padrão de alerta se necessário
  }

  private getService(modulo: string): any {
    if (!modulo || typeof modulo !== 'string') {
      throw new BadRequestException(`Módulo inválido fornecido: ${modulo}`);
    }
    
    // Usar o ModuleRegistryService para obter informações do módulo
    const moduleInfo = this.registry.getModuleInfo(modulo);
    if (!moduleInfo || !moduleInfo.service) {
      // Tentar buscar pelos módulos disponíveis
      const availableModules = this.registry.getAllModules();
      throw new BadRequestException(
        `Módulo '${modulo}' não encontrado. Módulos disponíveis: ${availableModules.join(', ')}`
      );
    }
  
    try {
      // Usar o nome da classe do serviço para buscar no contexto do NestJS
      const serviceName = moduleInfo.service.name;
      const service = this.moduleRef.get(moduleInfo.service, { strict: false });
      
      if (!service) {
        throw new InternalServerErrorException(
          `Serviço '${serviceName}' não encontrado no contexto do NestJS`
        );
      }
      
      return service;
    } catch (error) {
      this.logger.error(`Erro ao obter serviço para módulo '${modulo}':`, error);
      throw new InternalServerErrorException(
        `Erro ao acessar serviço do módulo '${modulo}': ${error.message}`
      );
    }
  }

  // Método principal para gerar relatórios
  async gerarRelatorio(config: RelatorioConfig): Promise<RelatorioResultado> {
    try {
      this.validarConfigRelatorio(config);
      const dados = await this.obterDadosParaRelatorio(config.modulo, config.filtros, config.periodo);
      const conteudo = await this.gerarConteudoRelatorio(config, dados);

      const resultado: RelatorioResultado = {
        id: this.gerarIdRelatorio(),
        titulo: this.gerarTituloRelatorio(config),
        conteudo: conteudo,
        metadados: {
          modulo: config.modulo,
          tipo: config.tipo,
          dataGeracao: new Date(),
          totalRegistros: Array.isArray(dados) ? dados.length : Object.keys(dados).length,
          periodo: config.periodo ? `${config.periodo.inicio.toISOString()} - ${config.periodo.fim.toISOString()}` : undefined
        }
      };

      return resultado;
    } catch (error) {
      throw new InternalServerErrorException({
        mensagem: 'Erro ao gerar relatório',
        erro: error.message,
        config: config
      });
    }
  }

  // Método para relatórios agendados/automáticos
  async gerarRelatorioAutomatico(modulo: string): Promise<RelatorioResultado> {
    const config: RelatorioConfig = {
      modulo: modulo,
      tipo: 'analitico',
      periodo: {
        inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
        fim: new Date()
      },
      formato: 'markdown'
    };

    return this.gerarRelatorio(config);
  }

  private validarConfigRelatorio(config: RelatorioConfig): void {
    if (!config.modulo) {
      throw new BadRequestException('Módulo é obrigatório para geração de relatório');
    }

    if (!['analitico', 'resumido', 'comparativo', 'tendencia', 'personalizado'].includes(config.tipo)) {
      throw new BadRequestException('Tipo de relatório inválido');
    }

    if (config.periodo && config.periodo.inicio > config.periodo.fim) {
      throw new BadRequestException('Data de início deve ser anterior à data de fim');
    }
  }

  private async gerarConteudoRelatorio(config: RelatorioConfig, dados: any): Promise<string> {
    const promptBase = this.construirPromptRelatorio(config, dados);
    
    const mensagens = [{ 
      role: 'user', 
      content: promptBase 
    }];

    const resposta = await conversarComIA(mensagens);
    
    return this.formatarConteudo(resposta.content, config.formato || 'texto');
  }

  private construirPromptRelatorio(config: RelatorioConfig, dados: any): string {
    const templatesPorTipo = {
      analitico: `
        Analise profundamente os dados do módulo ${config.modulo}.
        Dados: ${JSON.stringify(dados, null, 2)}
        
        Gere um relatório analítico detalhado incluindo:
        1. Resumo executivo
        2. Análise de tendências
        3. Insights principais
        4. Recomendações estratégicas
        5. Indicadores de performance (se aplicável)
        6. Conclusões e próximos passos
      `,
      
      resumido: `
        Crie um resumo conciso dos dados do módulo ${config.modulo}.
        Dados: ${JSON.stringify(dados, null, 2)}
        
        Inclua apenas:
        1. Métricas principais
        2. Destaques importantes
        3. Alertas críticos (se houver)
        4. Resumo em bullet points
      `,
      
      comparativo: `
        Compare e analise os dados do módulo ${config.modulo}.
        Dados: ${JSON.stringify(dados, null, 2)}
        
        Faça comparações entre:
        1. Períodos (se dados temporais disponíveis)
        2. Categorias diferentes
        3. Performance vs metas (se aplicável)
        4. Benchmarks internos
      `,
      
      tendencia: `
        Analise tendências nos dados do módulo ${config.modulo}.
        Dados: ${JSON.stringify(dados, null, 2)}
        
        Foque em:
        1. Padrões temporais
        2. Sazonalidades
        3. Projeções futuras
        4. Fatores de influência
        5. Recomendações baseadas em tendências
      `,
      
      personalizado: `
        Gere um relatório personalizado para o módulo ${config.modulo}.
        Dados: ${JSON.stringify(dados, null, 2)}
        Métricas solicitadas: ${config.metricas?.join(', ') || 'todas disponíveis'}
        Filtros aplicados: ${JSON.stringify(config.filtros) || 'nenhum'}
        
        Customize o relatório baseado nos parâmetros específicos fornecidos.
      `
    };

    return templatesPorTipo[config.tipo] || templatesPorTipo.analitico;
  }

  private formatarConteudo(conteudo: string, formato: string): string {
    switch (formato) {
      case 'json':
        try {
          return JSON.stringify({ relatorio: conteudo }, null, 2);
        } catch {
          return conteudo;
        }
      
      case 'markdown':
        if (!conteudo.includes('#') && !conteudo.includes('**')) {
          return `# Relatório\n\n${conteudo}`;
        }
        return conteudo;
      
      case 'texto':
      default:
        return conteudo;
    }
  }

  private gerarTituloRelatorio(config: RelatorioConfig): string {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const tipoCapitalizado = config.tipo.charAt(0).toUpperCase() + config.tipo.slice(1);
    const moduloCapitalizado = config.modulo.charAt(0).toUpperCase() + config.modulo.slice(1);
    
    return `Relatório ${tipoCapitalizado} - ${moduloCapitalizado} (${dataAtual})`;
  }

  private gerarIdRelatorio(): string {
    return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Método unificado para obter dados (substitui todos os métodos obterDados específicos)
  private async obterDadosParaRelatorio(modulo: string, filtros?: Record<string, any>, periodo?: { inicio: Date; fim: Date }): Promise<any> {
    if (!modulo) {
      throw new BadRequestException('Módulo não especificado para obterDadosParaRelatorio.');
    }

    const service = this.getService(modulo);
    if (!service) {
      throw new InternalServerErrorException(`Serviço para o módulo '${modulo}' não encontrado.`);
    }

    // Método genérico que funciona para todos os módulos
    if (service.findAll) {
      return service.findAll(filtros);
    }
    return {};
  }

  // Método principal para otimização de processos
  async otimizarProcessos(tarefa: string, contextoGlobal: any) {
    let observacao = '';
    let decisao = '';
    let iteracoes = 0;
    const maxIteracoes = 5;

    while (iteracoes < maxIteracoes && decisao !== 'concluido') {
      const prompt = `
        Você é um agente IA central autônomo. Tarefa: ${tarefa}. Contexto: ${JSON.stringify(contextoGlobal)}.
        Observação: ${observacao}.
        Decida ação: 'otimizar_pacientes', 'agendar_consulta', 'gerar_fatura', 'gerar_relatorio', 'emitir_alerta', ou 'concluido'.
        Para 'gerar_relatorio' e 'emitir_alerta', inclua um campo 'modulo' dentro de 'parametros' para especificar o módulo relevante (ex: 'patients', 'appointments', 'invoices', 'stock').
        Para relatórios, seja criativo e personalize com detalhes relevantes.
        Para alertas, use linguagem clara, sugestões acionáveis e criatividade para eficiência (ex: vencimentos, estoque baixo).
        Responda JSON: { "raciocinio": "...", "acao": "...", "parametros": {} }
      `;

      const mensagens = [{ role: 'user', content: prompt }];
      const resposta = await conversarComIA(mensagens);
      let parsed;
      try {
        const jsonMatch = resposta.content.match(/```json\n([\s\S]*?)\n```/);
        let jsonString = resposta.content;
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1];
        }
        parsed = JSON.parse(jsonString);
      } catch (e) {
        throw new BadRequestException({
          mensagem: 'Erro ao analisar JSON da IA.',
          erro: e.message,
          conteudo: resposta.content
        });
      }

      decisao = parsed.acao;
      try {
        if (decisao === 'otimizar_pacientes') {
          const patientsService = this.getService('patients');
          await patientsService.update(parsed.parametros.patientId, parsed.parametros.atualizacoes);
          observacao = 'Pacientes otimizados.';
        } else if (decisao === 'agendar_consulta') {
          const appointmentsService = this.getService('appointments');
          await appointmentsService.create(parsed.parametros.appointmentData);
          observacao = 'Consulta agendada.';
        } else if (decisao === 'gerar_fatura') {
          const invoicesService = this.getService('invoices');
          await invoicesService.create(parsed.parametros.invoiceData);
          observacao = 'Fatura gerada.';
        } else if (decisao === 'gerar_relatorio') {
          const relatorio = await this.gerarRelatorioPersonalizado(parsed.parametros);
          observacao = `Relatório gerado: ${relatorio}`;
        } else if (decisao === 'emitir_alerta') {
          const alerta = await this.emitirAlertaInteligente(parsed.parametros);
          observacao = `Alerta emitido: ${alerta}`;
        }
      } catch (serviceError) {
        throw new InternalServerErrorException({
          mensagem: 'Erro ao executar ação do serviço.',
          erro: serviceError.message,
          acao: decisao,
          parametros: parsed.parametros
        });
      }
      iteracoes++;
    }
    return { resultado: 'Otimização concluída.', detalhes: observacao };
  }

  private async gerarRelatorioPersonalizado(parametros: any): Promise<string> {
    const config: RelatorioConfig = {
      modulo: parametros.modulo,
      tipo: parametros.tipo || 'personalizado',
      filtros: parametros.filtros,
      formato: parametros.formato || 'texto',
      metricas: parametros.metricas
    };

    const resultado = await this.gerarRelatorio(config);
    return resultado.conteudo;
  }

  private async emitirAlertaInteligente(parametros: any): Promise<string> {
    const modulo = parametros.modulo;
    if (!modulo || typeof modulo !== 'string') {
      throw new BadRequestException('Parâmetro "modulo" ausente ou inválido para alerta.');
    }
    const contexto = await this.verificarContextoAlerta(modulo);
    const promptAlerta = `Crie um alerta criativo e acionável para ${parametros.tipo} (ex: vencimento ou estoque baixo) baseado em: ${JSON.stringify(contexto)}. Use linguagem clara e sugestões para eficiência.`;
    const mensagens = [{ role: 'user', content: promptAlerta }];
    const resposta = await conversarComIA(mensagens);
    return resposta.content;
  }

  private async verificarContextoAlerta(modulo: string): Promise<any> {
    if (!modulo) {
      throw new BadRequestException('Módulo não especificado para verificarContextoAlerta.');
    }
    const service = this.getService(modulo);
    if (!service) {
      throw new InternalServerErrorException(`Serviço para o módulo '${modulo}' não encontrado.`);
    }
    if (modulo === 'stock' && service.verificarEstoqueBaixo) {
      return service.verificarEstoqueBaixo();
    }
    return {};
  }

  // Consulta dinâmica ao banco de dados (versão unificada)
  async executeDynamicQuery(query: DatabaseQuery): Promise<any> {
    try {
      const cacheKey = this.generateCacheKey(query);
      const cached = this.queryCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
        return cached.data;
      }

      const service = this.getService(query.module);
      if (!service) {
        throw new Error(`Service for module ${query.module} not found`);
      }

      let result;
      if (service.findAll) {
        result = await service.findAll(query.conditions || {});
      } else {
        result = {};
      }

      // Cache do resultado
      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: new Date(),
        ttl: this.CACHE_TTL
      });

      return result;
    } catch (error) {
      this.logger.error('Erro na consulta dinâmica:', error);
      throw new InternalServerErrorException('Erro ao executar consulta dinâmica');
    }
  }

  
  // Método para limpar e extrair JSON da resposta da IA
  private cleanAndParseAIResponse(content: string): AIResponse {
    try {
      // Remove blocos de código markdown
      let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remove quebras de linha extras e espaços
      cleanContent = cleanContent.trim();
      
      // Tenta encontrar JSON válido na resposta
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      // Parse do JSON
      const parsed = JSON.parse(cleanContent);
      
      // Validação dos campos obrigatórios
      if (!parsed.interpretation || !parsed.query || !parsed.explanation) {
        throw new Error('Resposta da IA não contém todos os campos obrigatórios');
      }
      
      return parsed;
    } catch (error) {
      throw new Error(`Erro ao processar resposta da IA: ${error.message}. Conteúdo: ${content.substring(0, 200)}...`);
    }
  }
  

  async processNaturalLanguageQuery(question: string): Promise<any> {
    try {
      const projectKnowledge = this.registry.getProjectKnowledge();
      const availableModules = this.registry.getAllModules(); // Módulos descobertos automaticamente
      
      const prompt = `
        Você é um assistente de banco de dados inteligente.
        Estrutura do projeto: ${JSON.stringify(projectKnowledge.structure, null, 2)}
        Módulos disponíveis: ${availableModules.join(', ')}
        
        Pergunta do usuário: "${question}"
        
        Converta esta pergunta em uma consulta estruturada usando APENAS os módulos disponíveis listados acima.
        Responda EXCLUSIVAMENTE em JSON, sem texto adicional, com o seguinte formato:
        {
          "interpretation": "interpretação da pergunta",
          "query": {
            "module": "nome_do_modulo_da_lista_acima",
            "entity": "nome_da_entidade",
            "operation": "find",
            "conditions": {}
          },
          "explanation": "explicação da consulta"
        }
        
        Exemplo de resposta JSON:
        {
          "interpretation": "Consulta de usuários ativos",
          "query": {
            "module": "users",
            "entity": "User",
            "operation": "find",
            "conditions": {
              "isActive": true
            }
          },
          "explanation": "Esta consulta busca todos os usuários que estão marcados como ativos."
        }

        IMPORTANTE: Use apenas os módulos da lista: ${availableModules.join(', ')}
      `;
  
      const mensagens = [{ role: 'user', content: prompt }];
      const resposta = await conversarComIA(mensagens);
      
      // Usa o método de limpeza e parsing
      const parsed = this.cleanAndParseAIResponse(resposta.content);
      
      // Validação adicional para garantir que module existe
      if (!parsed.query || !parsed.query.module) {
        throw new Error('Campo module é obrigatório na query');
      }
      
      // Executa a consulta
      const queryResult = await this.executeDynamicQuery(parsed.query);
      
      return {
        question,
        interpretation: parsed.interpretation,
        query: parsed.query,
        result: queryResult,
        explanation: parsed.explanation,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Erro no processamento de linguagem natural:', {
        error: error.message,
        stack: error.stack,
        question
      });
      throw new InternalServerErrorException(`Erro ao processar pergunta: ${error.message}`);
    }
  }

  // Sistema de alertas inteligentes (versão unificada)
  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const alertRule: AlertRule = {
      ...rule,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    
    this.alertRules.set(alertRule.id, alertRule);
    return alertRule;
  }

  async getActiveAlerts(): Promise<AlertRule[]> {
    return Array.from(this.alertRules.values()).filter(rule => rule.isActive);
  }

  async deleteAlertRule(id: string): Promise<void> {
    this.alertRules.delete(id);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkAlerts(): Promise<void> {
    const activeRules = await this.getActiveAlerts();
    
    for (const rule of activeRules) {
      try {
        const shouldTrigger = await this.evaluateAlertCondition(rule);
        if (shouldTrigger) {
          await this.triggerAlert(rule);
        }
      } catch (error) {
        this.logger.error(`Error checking alert ${rule.id}: ${error.message}`);
      }
    }
  }

    async dailyIntelligentAssistant(action: string, context?: any): Promise<any> {
    try {
      const prompt = `
        Você é um assistente inteligente diário. 
        Ação solicitada: ${action}
        Contexto: ${JSON.stringify(context || {})}
        
        Execute a ação solicitada de forma inteligente e retorne o resultado.
        Ações possíveis: 'resumo_diario', 'alertas_pendentes', 'sugestoes_otimizacao', 'relatorio_performance'
        
        Responda em JSON: { "resultado": "...", "detalhes": "...", "sugestoes": [] }
      `;

      const mensagens = [{ role: 'user', content: prompt }];
      const resposta = await conversarComIA(mensagens);
      
      try {
        return JSON.parse(resposta.content);
      } catch {
        return {
          resultado: resposta.content,
          detalhes: 'Assistente executado com sucesso',
          sugestoes: []
        };
      }
    } catch (error) {
      this.logger.error('Erro no assistente diário:', error);
      return {
        resultado: 'Erro no assistente diário',
        detalhes: error.message,
        sugestoes: ['Verificar configuração do serviço de IA']
      };
    }
  }

  private async evaluateAlertCondition(rule: AlertRule): Promise<boolean> {
    // Implementar lógica de avaliação de condições baseada na regra
    return false;
  }

  private async triggerAlert(rule: AlertRule): Promise<void> {
    this.logger.warn(`Alert triggered: ${rule.name}`);
    
    for (const action of rule.actions) {
      await this.executeAlertAction(action, rule);
    }
    
    rule.lastTriggered = new Date();
    this.alertRules.set(rule.id, rule);
  }

  private async executeAlertAction(action: AlertAction, rule: AlertRule): Promise<void> {
    switch (action.type) {
      case 'email':
        this.logger.log(`Email alert sent to ${action.target}`);
        break;
      case 'notification':
        this.logger.log(`Notification sent: ${action.message}`);
        break;
      case 'webhook':
        this.logger.log(`Webhook called: ${action.target}`);
        break;
    }
  }

  async generateIntelligentReport(request: string): Promise<RelatorioResultado> {
    try {
      const config = await this.parseReportRequest(request);
      return await this.gerarRelatorio(config);
    } catch (error) {
      return {
        id: this.gerarIdRelatorio(),
        titulo: 'Erro na geração inteligente',
        conteudo: error.message,
        metadados: {
          modulo: 'ai-agent',
          tipo: 'erro',
          dataGeracao: new Date(),
          totalRegistros: 0
        }
      };
    }
  }

  private async parseReportRequest(request: string): Promise<RelatorioConfig> {
    // Implementar parsing inteligente da solicitação
    return {
      modulo: 'general',
      tipo: 'personalizado',
      formato: 'texto'
    };
  }

  private generateCacheKey(query: DatabaseQuery): string {
    return `query_${JSON.stringify(query)}`;
  }
}