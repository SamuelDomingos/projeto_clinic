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
  operation?: 'find' | 'count' | 'join';
  conditions?: Record<string, any>;
  orderBy?: Record<string, 'ASC' | 'DESC'>;
  limit?: number;
  offset?: number;
  // JOINs relacionais
  joins?: {
    table: string;
    on: string;
    type?: 'INNER' | 'LEFT' | 'RIGHT';
    select?: string[];
  }[];
  relations?: string[];
  groupBy?: string[];
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
  private readonly CACHE_TTL = 300000; // 5 min
  private readonly SCHEMA_REFRESH_INTERVAL = 300000; // 5 min
  private readonly CONTEXT_TTL = 1800000; // 30 min

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    // best-effort inicial
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
    } catch (error: any) {
      this.logger.error('Error refreshing database schema:', error);
    }
  }

  /**
   * Contexto conversacional
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
    for (const [sid, context] of this.conversationContext.entries()) {
      if (now.getTime() - context.lastAccess.getTime() > this.CONTEXT_TTL) {
        this.conversationContext.delete(sid);
      }
    }
  }

  /**
   * Obtém schema por nome da tabela (case-insensitive)
   */
  private getTableSchema(tableName: string): DatabaseSchema | null {
    return this.schemaCache.get((tableName || '').toLowerCase()) || null;
  }

  /**
   * Lista tabelas disponíveis
   */
  private getAvailableTables(): string[] {
    return Array.from(this.schemaCache.keys());
  }

  /**
   * Executa consulta SQL direta
   */
  private async executeDirectQuery(query: string, parameters?: any[]): Promise<any[]> {
    try {
      const result = await this.dataSource.query(query, parameters);
      return Array.isArray(result) ? result : [result];
    } catch (error: any) {
      this.logger.error('Error executing direct query:', error);
      throw new InternalServerErrorException(`Erro na consulta: ${error.message}`);
    }
  }

  /**
   * Monta SQL simples (ou delega para relacional) usando o schema
   */
  private buildSQLQueryWithSchema(schema: DatabaseSchema, query: DatabaseQuery): { sql: string; parameters: any[] } {
    // Se houver JOINs, usa o método relacional
    if (query.joins && query.joins.length > 0) {
      return this.buildRelationalSQLQuery(schema, query);
    }
    
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

    // WHERE
    if (query.conditions && Object.keys(query.conditions).length > 0) {
      const whereConditions: string[] = [];

      for (const [field, value] of Object.entries(query.conditions)) {
        if (value !== undefined && value !== null) {
          const columnExists = schema.columns.some(
            col => col.name.toLowerCase() === field.toLowerCase()
          );
          if (columnExists) {
            if (typeof value === 'object' && value !== null) {
              const v: any = value;
              if (v.gte && v.lte) {
                whereConditions.push(`${field} >= ? AND ${field} <= ?`);
                parameters.push(v.gte, v.lte);
              } else if (v.gte) {
                whereConditions.push(`${field} >= ?`);
                parameters.push(v.gte);
              } else if (v.lte) {
                whereConditions.push(`${field} <= ?`);
                parameters.push(v.lte);
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

    // ORDER BY
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

    // LIMIT / OFFSET
    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
    }
    if (query.offset) {
      sql += ` OFFSET ${query.offset}`;
    }

    return { sql, parameters };
  }

  /**
   * Cache key
   */
  private generateCacheKey(query: DatabaseQuery): string {
    return `${query.entity}_${JSON.stringify(query.conditions || {})}_${query.limit || 100}`;
  }

  /**
   * Executa consulta dinâmica
   */
  async executeDynamicQuery(query: DatabaseQuery): Promise<any> {
    try {
      const cacheKey = this.generateCacheKey(query);
      const cached = this.queryCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
        return cached.data;
      }

      // Resolve schema (entity ou module)
      const schema =
        this.getTableSchema(query.entity) ||
        (query.module ? this.getTableSchema(query.module) : null);

      if (!schema) {
        throw new BadRequestException(
          `Schema não encontrado para '${query.entity}'`
        );
      }

      const { sql, parameters } = this.buildSQLQueryWithSchema(schema, query);
      const result = await this.executeDirectQuery(sql, parameters);

      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: new Date(),
        ttl: this.CACHE_TTL
      });

      return result;
    } catch (error: any) {
      this.logger.error('Erro na consulta dinâmica:', error);
      throw new InternalServerErrorException(`Erro ao executar consulta dinâmica: ${error.message}`);
    }
  }

  /**
   * Gera resposta conversacional
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
    } catch (error: any) {
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
   * Fallback inteligente
   */
  private createIntelligentFallback(
    question: string, 
    availableTables: string[], 
    history: Array<any> = []
  ): any {
    const questionLower = question.toLowerCase();
    
    const recentEntities = history.slice(-3).map(h => {
      const q = h.question?.toLowerCase() || '';
      if (q.includes('paciente') || q.includes('patient')) return 'patients';
      if (q.includes('produto') || q.includes('product')) return 'products';
      if (q.includes('agendamento') || q.includes('appointment')) return 'appointments';
      return null;
    }).filter(Boolean) as string[];
    
    let entity = 'patients';
    
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
    
    if (!availableTables.includes(entity)) {
      entity =
        availableTables.find(table => 
          table.includes(entity.replace(/s$/, '')) || 
          entity.includes(table.replace(/s$/, ''))
        ) || availableTables[0] || 'patients';
    }
    
    const conditions: Record<string, any> = {};
    const nameMatch = questionLower.match(/nome.*?([a-zA-Z]+)/);
    if (nameMatch && nameMatch[1] && nameMatch[1].length > 2) {
      conditions['name'] = nameMatch[1];
    }
    
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
        orderBy: { createdAt: 'DESC' }, // 👈 respeita o type 'ASC' | 'DESC'
        limit: 100
      },
      explanation: `Query gerada por fallback inteligente considerando contexto conversacional`,
      confidence: 0.8,
      usedContext: recentEntities.length > 0
    };
  }

  /**
   * Interpreta consultas relacionais a partir da pergunta - VERSÃO APRIMORADA
   */
  private interpretRelationalQuery(question: string, availableTables: string[]): DatabaseQuery | null {
    const q = question.toLowerCase();
    
    // === RELACIONAMENTOS PACIENTE-CENTRADOS ===
    
    // Paciente + Agendamentos (mais abrangente)
    if ((q.includes('paciente') || q.includes('patient')) && 
        (q.includes('consulta') || q.includes('agendamento') || q.includes('appointment') || 
         q.includes('horário') || q.includes('marcado') || q.includes('próxima'))) {
      return {
        module: 'patients',
        entity: 'patients',
        operation: 'join',
        joins: [{
          table: 'appointments',
          on: 'patients.id = appointments.patientId',
          type: 'LEFT',
          select: ['date', 'startTime', 'duration', 'procedure', 'status']
        }, {
          table: 'users',
          on: 'appointments.doctorId = users.id',
          type: 'LEFT',
          select: ['name as doctor_name', 'role']
        }],
        conditions: {},
        orderBy: { 'appointments.date': 'DESC' },
        limit: 50
      };
    }
    
    // Paciente + Prontuários + Médico
    if ((q.includes('paciente') || q.includes('patient')) && 
        (q.includes('prontuário') || q.includes('medical') || q.includes('histórico') || 
         q.includes('evolução') || q.includes('observação') || q.includes('prescrição'))) {
      return {
        module: 'patients',
        entity: 'patients',
        operation: 'join',
        joins: [{
          table: 'medical_records',
          on: 'patients.id = medical_records.patientId',
          type: 'LEFT',
          select: ['date', 'recordCategory', 'content', 'attachments']
        }, {
          table: 'users',
          on: 'medical_records.doctorId = users.id',
          type: 'LEFT',
          select: ['name as doctor_name']
        }],
        conditions: {},
        orderBy: { 'medical_records.date': 'DESC' },
        limit: 50
      };
    }
    
    // Paciente + Protocolos + Serviços
    if ((q.includes('paciente') || q.includes('patient')) && 
        (q.includes('protocolo') || q.includes('tratamento') || q.includes('serviço') || 
         q.includes('procedimento') || q.includes('terapia'))) {
      return {
        module: 'patients',
        entity: 'patients',
        operation: 'join',
        joins: [{
          table: 'patient_protocols',
          on: 'patients.id = patient_protocols.patientId',
          type: 'LEFT',
          select: ['startDate', 'endDate', 'status']
        }, {
          table: 'protocols',
          on: 'patient_protocols.protocolId = protocols.id',
          type: 'LEFT',
          select: ['name as protocol_name', 'totalPrice']
        }],
        conditions: {},
        orderBy: { 'patient_protocols.startDate': 'DESC' },
        limit: 50
      };
    }
    
    // Paciente + Faturas + Pagamentos
    if ((q.includes('paciente') || q.includes('patient')) && 
        (q.includes('fatura') || q.includes('invoice') || q.includes('pagamento') || 
         q.includes('cobrança') || q.includes('débito') || q.includes('financeiro'))) {
      return {
        module: 'patients',
        entity: 'patients',
        operation: 'join',
        joins: [{
          table: 'invoices',
          on: 'patients.id = invoices.patientId',
          type: 'LEFT',
          select: ['number', 'type', 'status', 'date', 'total', 'subtotal', 'discount']
        }, {
          table: 'invoice_payments',
          on: 'invoices.id = invoice_payments.invoiceId',
          type: 'LEFT',
          select: ['amount', 'paymentDate', 'method']
        }],
        conditions: {},
        orderBy: { 'invoices.date': 'DESC' },
        limit: 50
      };
    }
    
    // === RELACIONAMENTOS AGENDAMENTO-CENTRADOS ===
    
    // Agendamentos + Paciente + Médico (mais detalhado)
    if (q.includes('consulta') || q.includes('agendamento') || q.includes('appointment') ||
        q.includes('agenda') || q.includes('horário')) {
      return {
        module: 'appointments',
        entity: 'appointments',
        operation: 'join',
        joins: [
          {
            table: 'patients',
            on: 'appointments.patientId = patients.id',
            type: 'LEFT',
            select: ['name', 'email', 'phone', 'birthDate']
          },
          {
            table: 'users',
            on: 'appointments.doctorId = users.id',
            type: 'LEFT',
            select: ['name as doctor_name', 'role', 'email as doctor_email']
          }
        ],
        conditions: {},
        orderBy: { 'appointments.date': 'DESC' },
        limit: 50
      };
    }
    
    // === RELACIONAMENTOS PRODUTO/ESTOQUE-CENTRADOS ===
    
    // Produtos + Estoque + Movimentações
    if (q.includes('produto') || q.includes('product') || q.includes('estoque') || 
        q.includes('stock') || q.includes('inventário') || q.includes('medicamento')) {
      return {
        module: 'products',
        entity: 'products',
        operation: 'join',
        joins: [{
          table: 'stock_locations',
          on: 'products.id = stock_locations.productId',
          type: 'LEFT',
          select: ['location', 'quantity']
        }, {
          table: 'stock_movements',
          on: 'products.id = stock_movements.productId',
          type: 'LEFT',
          select: ['type', 'quantity', 'createdAt', 'reason']
        }],
        conditions: {},
        orderBy: { 'stock_movements.createdAt': 'DESC' },
        limit: 50
      };
    }
    
    // === RELACIONAMENTOS PROTOCOLO-CENTRADOS ===
    
    // Protocolos + Serviços + Pacientes
    if (q.includes('protocolo') || q.includes('protocol') || q.includes('tratamento') ||
        q.includes('serviço') || q.includes('procedimento')) {
      return {
        module: 'protocols',
        entity: 'protocols',
        operation: 'join',
        joins: [{
          table: 'protocol_services',
          on: 'protocols.id = protocol_services.protocolId',
          type: 'LEFT',
          select: ['quantity', 'unitPrice']
        }, {
          table: 'services',
          on: 'protocol_services.serviceId = services.id',
          type: 'LEFT',
          select: ['name as service_name', 'description', 'price']
        }, {
          table: 'patient_protocols',
          on: 'protocols.id = patient_protocols.protocolId',
          type: 'LEFT',
          select: ['startDate', 'endDate', 'status']
        }],
        conditions: {},
        orderBy: { 'protocols.createdAt': 'DESC' },
        limit: 50
      };
    }
    
    // === RELACIONAMENTOS FINANCEIRO-CENTRADOS ===
    
    // Faturas + Itens + Pagamentos + Pacientes
    if (q.includes('fatura') || q.includes('invoice') || q.includes('pagamento') ||
        q.includes('financeiro') || q.includes('cobrança') || q.includes('receita')) {
      return {
        module: 'invoices',
        entity: 'invoices',
        operation: 'join',
        joins: [{
          table: 'patients',
          on: 'invoices.patientId = patients.id',
          type: 'LEFT',
          select: ['name', 'email', 'phone']
        }, {
          table: 'invoice_items',
          on: 'invoices.id = invoice_items.invoiceId',
          type: 'LEFT',
          select: ['description', 'quantity', 'unitPrice', 'totalPrice']
        }, {
          table: 'invoice_payments',
          on: 'invoices.id = invoice_payments.invoiceId',
          type: 'LEFT',
          select: ['amount', 'paymentDate', 'method', 'status']
        }],
        conditions: {},
        orderBy: { 'invoices.date': 'DESC' },
        limit: 50
      };
    }
    
    // === RELACIONAMENTOS MÉDICO-CENTRADOS ===
    
    // Médicos + Agendamentos + Prontuários
    if (q.includes('médico') || q.includes('doctor') || q.includes('profissional') ||
        q.includes('doutor') || q.includes('dra') || q.includes('dr')) {
      return {
        module: 'users',
        entity: 'users',
        operation: 'join',
        joins: [{
          table: 'appointments',
          on: 'users.id = appointments.doctorId',
          type: 'LEFT',
          select: ['date', 'startTime', 'procedure', 'status']
        }, {
          table: 'patients',
          on: 'appointments.patientId = patients.id',
          type: 'LEFT',
          select: ['name as patient_name', 'email as patient_email']
        }, {
          table: 'medical_records',
          on: 'users.id = medical_records.doctorId',
          type: 'LEFT',
          select: ['date as record_date', 'recordCategory']
        }],
        conditions: { 'users.role': 'doctor' },
        orderBy: { 'appointments.date': 'DESC' },
        limit: 50
      };
    }
    
    // === RELACIONAMENTOS COMPLEXOS MULTI-ENTIDADE ===
    
    // Análise completa do paciente (todos os dados relacionados)
    if (q.includes('completo') || q.includes('tudo') || q.includes('todos') || 
        q.includes('histórico completo') || q.includes('visão geral')) {
      return {
        module: 'patients',
        entity: 'patients',
        operation: 'join',
        joins: [{
          table: 'appointments',
          on: 'patients.id = appointments.patientId',
          type: 'LEFT',
          select: ['date as appointment_date', 'procedure', 'status as appointment_status']
        }, {
          table: 'medical_records',
          on: 'patients.id = medical_records.patientId',
          type: 'LEFT',
          select: ['date as record_date', 'recordCategory']
        }, {
          table: 'invoices',
          on: 'patients.id = invoices.patientId',
          type: 'LEFT',
          select: ['number as invoice_number', 'total', 'status as invoice_status']
        }],
        conditions: {},
        orderBy: { 'patients.name': 'ASC' },
        limit: 30
      };
    }
    
    return null;
  }

  /**
   * Processa pergunta com contexto inteligente - MÉTODO PRINCIPAL
   */
  async processNaturalLanguageQueryWithContext(
    question: string, 
    sessionId: string = 'default'
  ): Promise<any> {
    try {
      await this.ensureSchemaFresh();
      const context = this.getOrCreateContext(sessionId);
      
      const availableTables = this.getAvailableTables();
      const schemaInfo = Array.from(this.schemaCache.values()).map(schema => ({
        table: schema.tableName,
        entity: schema.entityName,
        columns: schema.columns.slice(0, 5).map(col => `${col.name} (${col.type})`)
      }));

      // 1) antes de chamar IA, tenta detectar consulta relacional
      let parsed: any | null = null;
      const relationalGuess = this.interpretRelationalQuery(question, availableTables);
      if (relationalGuess) {
        parsed = {
          interpretation: 'Consulta relacional detectada automaticamente',
          query: relationalGuess,
          explanation: 'Detectado padrão de relacionamento a partir da pergunta'
        };
      }

      // 2) se não detectou, usa IA com fallback inteligente
      if (!parsed) {
        const conversationHistory = context.history.slice(-3).map(h => 
          `Q: ${h.question} -> R: ${h.response.totalResults || 0} resultados`
        ).join('\n');

        const enhancedPrompt = `
CONTEXTO DA CONVERSA:\n${conversationHistory}\n\nESTRUTURA DO BANCO:\n${JSON.stringify(schemaInfo, null, 2)}\n\nTABELAS: ${availableTables.join(', ')}\n\nPERGUNTA ATUAL: "${question}"\n\nINSTRUÇÕES:\n- Use EXATAMENTE os nomes: "patients", "appointments", "users", "products"\n- SEMPRE use "operation": "find"\n- Para consultas gerais: "conditions": {}\n- Considere o contexto da conversa anterior\n\nRESPONDA APENAS COM JSON:\n{\n  "interpretation": "interpretação",\n  "query": {\n    "module": "nome_tabela",\n    "entity": "nome_tabela",\n    "operation": "find",\n    "conditions": {},\n    "orderBy": {},\n    "limit": 100\n  },\n  "explanation": "explicação"\n}`;

        const resposta = await conversarComIAParaJSON(enhancedPrompt, {
          availableTables,
          schemaInfo
        });

        if (!resposta.success || (resposta as any).fromFallback) {
          parsed = this.createIntelligentFallback(question, availableTables, context.history);
          this.logger.warn('Using intelligent fallback for query processing');
        } else {
          try {
            let cleanContent = (resposta.content || '').trim();
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) cleanContent = jsonMatch[0];
            parsed = JSON.parse(cleanContent);
            if (!parsed.query || !parsed.query.entity) {
              throw new Error('Invalid JSON structure');
            }
          } catch {
            parsed = this.createIntelligentFallback(question, availableTables, context.history);
            this.logger.warn('JSON parsing failed, using intelligent fallback');
          }
        }
      }

      // Normaliza query
      parsed.query.entity = String(parsed.query.entity || '').toLowerCase();
      parsed.query.module = (parsed.query.module?.toLowerCase?.() || parsed.query.entity);
      parsed.query.operation = parsed.query.operation || 'find';
      
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
        usedFallback: false
      };
      
      // Salva no contexto (máx 10)
      context.history.push({
        question,
        response: result,
        timestamp: new Date()
      });
      if (context.history.length > 10) {
        context.history = context.history.slice(-10);
      }
      
      return result;
      
    } catch (error: any) {
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

  /**
   * Constrói SQL com suporte a JOINs e relacionamentos
   */
  private buildRelationalSQLQuery(schema: DatabaseSchema, query: DatabaseQuery): { sql: string; parameters: any[] } {
    let sql = '';
    const parameters: any[] = [];
    const selectFields: string[] = [];

    // Campos da tabela principal
    selectFields.push(`${schema.tableName}.*`);

    switch (query.operation || 'find') {
      case 'find':
      case 'join':
        sql = `SELECT ${selectFields.join(', ')} FROM ${schema.tableName}`;
        break;
      case 'count':
        sql = `SELECT COUNT(DISTINCT ${schema.tableName}.id) as total FROM ${schema.tableName}`;
        break;
      default:
        throw new BadRequestException(`Operação '${query.operation}' não suportada`);
    }

    // JOINs
    if (query.joins && query.joins.length > 0) {
      for (const join of query.joins) {
        const joinType = join.type || 'LEFT';
        sql += ` ${joinType} JOIN ${join.table} ON ${join.on}`;

        if (join.select && join.select.length > 0) {
          const joinFields = join.select.map(field => `${join.table}.${field} as ${join.table}_${field}`);
          selectFields.push(...joinFields);
        }
      }

      // Reconstrói o SELECT com campos dos JOINs (se não for count)
      if (query.operation !== 'count') {
        sql = sql.replace(`SELECT ${schema.tableName}.*`, `SELECT ${selectFields.join(', ')}`);
      }
    }

    // WHERE (suporta "tabela.campo")
    if (query.conditions && Object.keys(query.conditions).length > 0) {
      const whereConditions: string[] = [];

      for (const [field, value] of Object.entries(query.conditions)) {
        if (value === undefined || value === null) continue;

        const [tableName, columnName] = field.includes('.')
          ? field.split('.')
          : [schema.tableName, field];

        if (typeof value === 'object' && value !== null) {
          const v: any = value;
          if (v.gte && v.lte) {
            whereConditions.push(`${tableName}.${columnName} >= ? AND ${tableName}.${columnName} <= ?`);
            parameters.push(v.gte, v.lte);
          } else if (v.gte) {
            whereConditions.push(`${tableName}.${columnName} >= ?`);
            parameters.push(v.gte);
          } else if (v.lte) {
            whereConditions.push(`${tableName}.${columnName} <= ?`);
            parameters.push(v.lte);
          }
        } else {
          whereConditions.push(`${tableName}.${columnName} LIKE ?`);
          parameters.push(`%${value}%`);
        }
      }

      if (whereConditions.length > 0) {
        sql += ` WHERE ${whereConditions.join(' AND ')}`;
      }
    }

    // GROUP BY
    if (query.groupBy && query.groupBy.length > 0) {
      sql += ` GROUP BY ${query.groupBy.join(', ')}`;
    }

    // ORDER BY (suporta "tabela.campo")
    if (query.orderBy && Object.keys(query.orderBy).length > 0) {
      const orderClauses = Object.entries(query.orderBy).map(([field, direction]) => {
        const [tableName, columnName] = field.includes('.') ? field.split('.') : [schema.tableName, field];
        return `${tableName}.${columnName} ${direction}`;
      });
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    } else {
      const createdColumn = schema.columns.find(col => col.name.toLowerCase().includes('created'));
      if (createdColumn) {
        sql += ` ORDER BY ${schema.tableName}.${createdColumn.name} DESC`;
      }
    }

    // LIMIT / OFFSET
    if (query.limit) {
      sql += ` LIMIT ${query.limit}`;
    }
    if (query.offset) {
      sql += ` OFFSET ${query.offset}`;
    }

    return { sql, parameters };
  }
}
