import { 
  Injectable, 
  BadRequestException, 
  InternalServerErrorException, 
  Logger 
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { conversarComIA, conversarComIAParaJSON } from '../../services/groq.service';

export interface DatabaseQuery {
  module: string;
  entity: string;
  operation?: 'find' | 'count';
  conditions?: Record<string, any>;
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  limit?: number;
  offset?: number;
}

interface DatabaseSchema {
  tableName: string;
  entityName: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    primary: boolean;
  }[];
  relations: {
    name: string;
    type: string;
    target: string;
  }[];
}

interface ConversationContext {
  history: Array<{
    question: string;
    response: any;
    timestamp: Date;
  }>;
  lastAccess: Date;
  sessionId: string;
}

@Injectable()
export class AIAgentService {
  private readonly logger = new Logger(AIAgentService.name);
  private queryCache: Map<string, { data: any; timestamp: Date; ttl: number }> = new Map();
  private schemaCache: Map<string, DatabaseSchema> = new Map();
  private conversationContext: Map<string, ConversationContext> = new Map();
  
  private schemaLastRefresh: Date = new Date(0);
  private readonly CACHE_TTL = 300000; // 5 minutos
  private readonly SCHEMA_REFRESH_INTERVAL = 300000; // 5 minutos
  private readonly CONTEXT_TTL = 1800000; // 30 minutos

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    this.refreshDatabaseSchema();
  }

  /**
   * Garante que o schema está atualizado
   */
  private async ensureSchemaFresh(): Promise<void> {
    const now = new Date();
    if (now.getTime() - this.schemaLastRefresh.getTime() > this.SCHEMA_REFRESH_INTERVAL) {
      await this.refreshDatabaseSchema();
      this.schemaLastRefresh = now;
      this.logger.log('Schema cache refreshed');
    }
  }

  /**
   * Descobre automaticamente todas as entidades do banco de dados
   */
  private async refreshDatabaseSchema(): Promise<void> {
    try {
      const entities = this.dataSource.entityMetadatas;
      
      for (const entity of entities) {
        const schema: DatabaseSchema = {
          tableName: entity.tableName,
          entityName: entity.name,
          columns: entity.columns.map(column => ({
            name: column.propertyName,
            type: String(column.type),
            nullable: column.isNullable,
            primary: column.isPrimary
          })),
          relations: entity.relations.map(relation => ({
            name: relation.propertyName,
            type: relation.relationType,
            target: relation.inverseEntityMetadata?.name || 'unknown'
          }))
        };

        this.schemaCache.set(entity.tableName.toLowerCase(), schema);
        this.logger.debug(`Schema cached for table: ${entity.tableName}`);
      }

      this.logger.log(`Database schema cached for ${entities.length} entities`);
    } catch (error) {
      this.logger.error('Error refreshing database schema:', error);
    }
  }

  /**
   * Gerencia contexto conversacional
   */
  private getOrCreateContext(sessionId: string): ConversationContext {
    if (!this.conversationContext.has(sessionId)) {
      this.conversationContext.set(sessionId, {
        history: [],
        lastAccess: new Date(),
        sessionId
      });
    }
    
    const context = this.conversationContext.get(sessionId)!;
    context.lastAccess = new Date();
    
    this.cleanupOldContexts();
    return context;
  }

  /**
   * Remove contextos expirados
   */
  private cleanupOldContexts(): void {
    const now = new Date();
    for (const [sessionId, context] of this.conversationContext.entries()) {
      if (now.getTime() - context.lastAccess.getTime() > this.CONTEXT_TTL) {
        this.conversationContext.delete(sessionId);
      }
    }
  }

  /**
   * Obtém informações do schema de uma tabela específica
   */
  private getTableSchema(tableName: string): DatabaseSchema | null {
    return this.schemaCache.get(tableName.toLowerCase()) || null;
  }

  /**
   * Lista todas as tabelas disponíveis no banco
   */
  private getAvailableTables(): string[] {
    return Array.from(this.schemaCache.keys());
  }

  /**
   * Executa consulta SQL direta no banco de dados
   */
  private async executeDirectQuery(query: string, parameters?: any[]): Promise<any[]> {
    try {
      const result = await this.dataSource.query(query, parameters);
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      this.logger.error('Error executing direct query:', error);
      throw new InternalServerErrorException(`Erro na consulta: ${error.message}`);
    }
  }

  /**
   * Constrói SQL usando schema específico
   */
  private buildSQLQuery(query: DatabaseQuery): { sql: string; parameters: any[] } {
    const tableName = query.entity.toLowerCase();
    const schema = this.getTableSchema(tableName);
    
    if (!schema) {
      const availableTables = this.getAvailableTables();
      const similarTable = availableTables.find(table => 
        table.includes(tableName) || tableName.includes(table.replace(/s$/, ''))
      );
      
      if (similarTable) {
        const similarSchema = this.getTableSchema(similarTable);
        if (similarSchema) {
          return this.buildSQLQueryWithSchema(similarSchema, query);
        }
      }
      
      throw new BadRequestException(`Tabela '${query.entity}' não encontrada. Tabelas disponíveis: ${availableTables.join(', ')}`);
    }

    return this.buildSQLQueryWithSchema(schema, query);
  }

  /**
   * Constrói SQL usando schema específico
   */
  private buildSQLQueryWithSchema(schema: DatabaseSchema, query: DatabaseQuery): { sql: string; parameters: any[] } {
    let sql = '';
    const parameters: any[] = [];

    switch (query.operation || 'find') {
      case 'find':
        sql = `SELECT * FROM ${schema.tableName}`;
        break;
      case 'count':
        sql = `SELECT COUNT(*) as total FROM ${schema.tableName}`;
        break;
      default:
        throw new BadRequestException(`Operação '${query.operation}' não suportada`);
    }

    // Adiciona condições WHERE
    if (query.conditions && Object.keys(query.conditions).length > 0) {
      const whereConditions: string[] = [];

      for (const [field, value] of Object.entries(query.conditions)) {
        if (value !== undefined && value !== null) {
          const columnExists = schema.columns.some(col => col.name.toLowerCase() === field.toLowerCase());
          if (columnExists) {
            if (typeof value === 'object' && value !== null) {
              if (value.gte && value.lte) {
                whereConditions.push(`${field} >= ? AND ${field} <= ?`);
                parameters.push(value.gte, value.lte);
              } else if (value.gte) {
                whereConditions.push(`${field} >= ?`);
                parameters.push(value.gte);
              } else if (value.lte) {
                whereConditions.push(`${field} <= ?`);
                parameters.push(value.lte);
              }
            } else {
              whereConditions.push(`${field} LIKE ?`);
              parameters.push(`%${value}%`);
            }
          }
        }
      }

      if (whereConditions.length > 0) {
        sql += ` WHERE ${whereConditions.join(' AND ')}`;
      }
    }

    // Adiciona ORDER BY
    if (query.orderBy && Object.keys(query.orderBy).length > 0) {
      const orderClauses = Object.entries(query.orderBy)
        .map(([field, direction]) => `${field} ${direction}`);
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    } else {
      const createdColumn = schema.columns.find(col => 
        col.name.toLowerCase().includes('created')
      );
      if (createdColumn) {
        sql += ` ORDER BY ${createdColumn.name} DESC`;
      }
    }

    // Adiciona LIMIT e OFFSET
    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
    }
    if (query.offset) {
      sql += ` OFFSET ${query.offset}`;
    }

    return { sql, parameters };
  }

  /**
   * Gera chave de cache para consulta
   */
  private generateCacheKey(query: DatabaseQuery): string {
    return `${query.entity}_${JSON.stringify(query.conditions)}_${query.limit || 100}`;
  }

  /**
   * Executa consulta dinâmica usando descoberta automática
   */
  async executeDynamicQuery(query: DatabaseQuery): Promise<any> {
    try {
      const cacheKey = this.generateCacheKey(query);
      const cached = this.queryCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
        return cached.data;
      }

      const { sql, parameters } = this.buildSQLQuery(query);
      const result = await this.executeDirectQuery(sql, parameters);

      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: new Date(),
        ttl: this.CACHE_TTL
      });

      return result;
    } catch (error) {
      this.logger.error('Erro na consulta dinâmica:', error);
      throw new InternalServerErrorException(`Erro ao executar consulta dinâmica: ${error.message}`);
    }
  }

  /**
   * Gera uma resposta conversacional baseada nos resultados da consulta
   */
  private async generateConversationalResponse(question: string, queryResult: any, interpretation: string): Promise<string> {
    try {
      const resultCount = Array.isArray(queryResult) ? queryResult.length : (queryResult ? 1 : 0);
      const hasResults = resultCount > 0;
      
      const prompt = `
        Você é um assistente médico inteligente. O usuário fez a pergunta: "${question}"
        
        Interpretação: ${interpretation}
        Resultados encontrados: ${resultCount}
        Tem dados: ${hasResults}
        
        ${hasResults ? 
          `Dados encontrados: ${JSON.stringify(queryResult).substring(0, 500)}...` : 
          'Nenhum resultado foi encontrado.'
        }
        
        Forneça uma resposta conversacional, amigável e informativa em português brasileiro.
        Seja conciso mas útil. Se não há resultados, explique de forma positiva e sugira alternativas.
        Se há resultados, resuma as informações principais de forma clara.
        
        Responda APENAS o texto da resposta, sem JSON ou formatação especial.
      `;

      const mensagens = [{ role: 'user', content: prompt }];
      const resposta = await conversarComIA(mensagens);
      
      return resposta.content.trim();
    } catch (error) {
      this.logger.error('Erro ao gerar resposta conversacional:', error);
      
      const resultCount = Array.isArray(queryResult) ? queryResult.length : (queryResult ? 1 : 0);
      if (resultCount === 0) {
        return 'Não encontrei resultados para sua consulta. Tente reformular a pergunta ou verificar se os dados existem no sistema.';
      } else {
        return `Encontrei ${resultCount} resultado(s) para sua consulta. Os dados foram processados com sucesso.`;
      }
    }
  }

  /**
   * Fallback inteligente melhorado com contexto
   */
  private createIntelligentFallback(
    question: string, 
    availableTables: string[], 
    history: Array<any> = []
  ): any {
    const questionLower = question.toLowerCase();
    
    // Analisa contexto da conversa
    const recentEntities = history.slice(-3).map(h => {
      const q = h.question?.toLowerCase() || '';
      if (q.includes('paciente') || q.includes('patient')) return 'patients';
      if (q.includes('produto') || q.includes('product')) return 'products';
      if (q.includes('agendamento') || q.includes('appointment')) return 'appointments';
      return null;
    }).filter(Boolean);
    
    let entity = 'patients'; // default
    
    // Detecção inteligente de entidade
    if (questionLower.includes('paciente') || questionLower.includes('patient')) {
      entity = 'patients';
    } else if (questionLower.includes('produto') || questionLower.includes('product') || 
               questionLower.includes('estoque') || questionLower.includes('monjaro')) {
      entity = 'products';
    } else if (questionLower.includes('agendamento') || questionLower.includes('consulta') || 
               questionLower.includes('appointment')) {
      entity = 'appointments';
    } else if (questionLower.includes('usuário') || questionLower.includes('user')) {
      entity = 'users';
    } else if (recentEntities.length > 0) {
entity = recentEntities[recentEntities.length - 1] || 'patients';
    }
    
    // Verifica se a tabela existe
    if (!availableTables.includes(entity)) {
      entity = availableTables.find(table => 
        table.includes(entity.replace(/s$/, '')) || 
        entity.includes(table.replace(/s$/, ''))
      ) || availableTables[0] || 'patients';
    }
    
    const conditions = {};
    
    // Detecção de filtros
    const nameMatch = questionLower.match(/nome.*?([a-zA-Z]+)/);
    if (nameMatch && nameMatch[1] && nameMatch[1].length > 2) {
      conditions['name'] = nameMatch[1];
    }
    
    // Filtros específicos para produtos
    if (entity === 'products') {
      const productMatch = questionLower.match(/(monjaro|ozempic|insulina|[a-zA-Z]{4,})/);
      if (productMatch && productMatch[1] && productMatch[1] !== 'quantos') {
        conditions['name'] = productMatch[1];
      }
    }
    
    return {
      interpretation: `Consulta inteligente para ${entity} (fallback com contexto)`,
      query: {
        module: entity,
        entity: entity,
        operation: 'find',
        conditions: conditions,
        orderBy: { createdAt: 'desc' },
        limit: 100
      },
      explanation: `Query gerada por fallback inteligente considerando contexto conversacional`,
      confidence: 0.8,
      usedContext: recentEntities.length > 0
    };
  }

  /**
   * Processa pergunta com contexto inteligente - MÉTODO PRINCIPAL
   */
  async processNaturalLanguageQueryWithContext(
    question: string, 
    sessionId: string = 'default'
  ): Promise<any> {
    try {
      // Garante schema atualizado
      await this.ensureSchemaFresh();
      
      // Obtém contexto da conversa
      const context = this.getOrCreateContext(sessionId);
      
      const availableTables = this.getAvailableTables();
      const schemaInfo = Array.from(this.schemaCache.values()).map(schema => ({
        table: schema.tableName,
        entity: schema.entityName,
        columns: schema.columns.slice(0, 5).map(col => `${col.name} (${col.type})`)
      }));

      // Constrói contexto conversacional
      const conversationHistory = context.history.slice(-3).map(h => 
        `Q: ${h.question} -> R: ${h.response.totalResults || 0} resultados`
      ).join('\n');

      const enhancedPrompt = `
CONTEXTO DA CONVERSA:\n${conversationHistory}\n\nESTRUTURA DO BANCO:\n${JSON.stringify(schemaInfo, null, 2)}\n\nTABELAS: ${availableTables.join(', ')}\n\nPERGUNTA ATUAL: "${question}"\n\nINSTRUÇÕES:\n- Use EXATAMENTE os nomes: "patients", "appointments", "users", "products"\n- SEMPRE use "operation": "find"\n- Para consultas gerais: "conditions": {}\n- Considere o contexto da conversa anterior\n\nRESPONDA APENAS COM JSON:\n{\n  "interpretation": "interpretação",\n  "query": {\n    "module": "nome_tabela",\n    "entity": "nome_tabela",\n    "operation": "find",\n    "conditions": {},\n    "orderBy": {},\n    "limit": 100\n  },\n  "explanation": "explicação"\n}`;

      // Tenta usar IA inteligente com fallback
      const resposta = await conversarComIAParaJSON(enhancedPrompt, {
        availableTables,
        conversationHistory,
        schemaInfo
      });
      
      let parsed;
      
      if (!resposta.success || resposta.fromFallback) {
        // Usa fallback inteligente melhorado
        parsed = this.createIntelligentFallback(question, availableTables, context.history);
        this.logger.warn('Using intelligent fallback for query processing');
      } else {
        try {
          let cleanContent = resposta.content.trim();
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanContent = jsonMatch[0];
          }
          parsed = JSON.parse(cleanContent);
          
          if (!parsed.query || !parsed.query.entity) {
            throw new Error('Invalid JSON structure');
          }
        } catch (parseError) {
          parsed = this.createIntelligentFallback(question, availableTables, context.history);
          this.logger.warn('JSON parsing failed, using intelligent fallback');
        }
      }

      // Normaliza query
      parsed.query.entity = parsed.query.entity.toLowerCase();
      parsed.query.module = parsed.query.module?.toLowerCase() || parsed.query.entity;
      parsed.query.operation = 'find';
      
      // Executa consulta
      const queryResult = await this.executeDynamicQuery(parsed.query);
      
      // Gera resposta conversacional
      const aiResponse = await this.generateConversationalResponse(
        question, 
        queryResult, 
        parsed.interpretation
      );
      
      const result = {
        question,
        aiResponse,
        result: queryResult,
        totalResults: Array.isArray(queryResult) ? queryResult.length : 1,
        timestamp: new Date(),
        sessionId,
        usedFallback: resposta.fromFallback || false
      };
      
      // Salva no contexto
      context.history.push({
        question,
        response: result,
        timestamp: new Date()
      });
      
      // Mantém apenas últimas 10 interações
      if (context.history.length > 10) {
        context.history = context.history.slice(-10);
      }
      
      return result;
      
    } catch (error) {
      this.logger.error('Error in contextual query processing:', {
        error: error.message,
        stack: error.stack,
        question,
        sessionId
      });
      
      return {
        question,
        error: `Erro ao processar pergunta: ${error.message}`,
        aiResponse: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente reformular de forma mais específica.',
        suggestion: 'Tente perguntas como: "quantos pacientes cadastrados?" ou "listar produtos em estoque"',
        timestamp: new Date(),
        sessionId
      };
    }
  }
}