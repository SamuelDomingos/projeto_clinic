import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ModuleRegistryService } from './module-registry.service';
import { conversarComIA } from '../../services/groq.service';

// Interfaces para tipos de relatórios
interface RelatorioConfig {
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

interface RelatorioResultado {
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

@Injectable()
export class AIAgentService {
  constructor(
    private moduleRef: ModuleRef,
    private registry: ModuleRegistryService,
  ) {}

  private getService(modulo: string): any {
    if (!modulo || typeof modulo !== 'string') {
      throw new BadRequestException(`Módulo inválido fornecido para getService: ${modulo}`);
    }
    const serviceToken = `SERVICE_${modulo.toUpperCase()}`;
    const service = this.moduleRef.get(serviceToken, { strict: false });
    if (!service) {
      throw new InternalServerErrorException(`Serviço para o módulo '${modulo}' não encontrado.`);
    }
    return service;
  }

  // Método principal para gerar relatórios
  async gerarRelatorio(config: RelatorioConfig): Promise<RelatorioResultado> {
    try {
      // Validar configuração
      this.validarConfigRelatorio(config);

      // Obter dados baseado no módulo e filtros
      const dados = await this.obterDadosParaRelatorio(config.modulo, config.filtros, config.periodo);

      // Gerar relatório usando IA
      const conteudo = await this.gerarConteudoRelatorio(config, dados);

      // Construir resultado
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

  // Método para gerar múltiplos relatórios
  async gerarRelatoriosEmLote(configs: RelatorioConfig[]): Promise<RelatorioResultado[]> {
    const resultados: RelatorioResultado[] = [];
    
    for (const config of configs) {
      try {
        const relatorio = await this.gerarRelatorio(config);
        resultados.push(relatorio);
      } catch (error) {
        // Log do erro mas continua processando outros relatórios
        console.error(`Erro ao gerar relatório para módulo ${config.modulo}:`, error);
        resultados.push({
          id: this.gerarIdRelatorio(),
          titulo: `Erro - ${config.modulo}`,
          conteudo: `Erro ao gerar relatório: ${error.message}`,
          metadados: {
            modulo: config.modulo,
            tipo: config.tipo,
            dataGeracao: new Date(),
            totalRegistros: 0
          }
        });
      }
    }

    return resultados;
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
    
    // Formatar conteúdo baseado no formato solicitado
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
          // Tentar estruturar como JSON se possível
          return JSON.stringify({ relatorio: conteudo }, null, 2);
        } catch {
          return conteudo;
        }
      
      case 'markdown':
        // Adicionar formatação markdown se não existir
        if (!conteudo.includes('#') && !conteudo.includes('**')) {
          return `# Relatório\n\n${conteudo}`;
        }
        return conteudo;
      
      case 'texto':
      default:
        return conteudo;
    }
  }

  private gerarIdRelatorio(): string {
    return `REL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private gerarTituloRelatorio(config: RelatorioConfig): string {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const tipoCapitalizado = config.tipo.charAt(0).toUpperCase() + config.tipo.slice(1);
    const moduloCapitalizado = config.modulo.charAt(0).toUpperCase() + config.modulo.slice(1);
    
    return `Relatório ${tipoCapitalizado} - ${moduloCapitalizado} (${dataAtual})`;
  }

  // Versão aprimorada do método original
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

  private async obterDadosParaRelatorio(modulo: string, filtros?: Record<string, any>, periodo?: { inicio: Date; fim: Date }): Promise<any> {
    if (!modulo) {
      throw new BadRequestException('Módulo não especificado para obterDadosParaRelatorio.');
    }

    const service = this.getService(modulo);
    if (!service) {
      throw new InternalServerErrorException(`Serviço para o módulo '${modulo}' não encontrado.`);
    }

    // Implementar lógica específica por módulo
    switch (modulo) {
      case 'patients':
        return this.obterDadosPacientes(service, filtros, periodo);
      
      case 'appointments':
        return this.obterDadosConsultas(service, filtros, periodo);
      
      case 'invoices':
        return this.obterDadosFaturas(service, filtros, periodo);
      
      case 'stock':
        return this.obterDadosEstoque(service, filtros, periodo);
      
      default:
        // Método genérico
        if (service.findAll) {
          return service.findAll(filtros);
        }
        return {};
    }
  }

  private async obterDadosPacientes(service: any, filtros?: any, periodo?: any): Promise<any> {
    let dados = await service.findAll();
    
    // Aplicar filtros se fornecidos
    if (filtros) {
      dados = dados.filter((paciente: any) => {
        return Object.keys(filtros).every(key => {
          if (filtros[key] === undefined) return true;
          return paciente[key] === filtros[key];
        });
      });
    }

    // Aplicar filtro de período se fornecido
    if (periodo && dados.length > 0) {
      dados = dados.filter((paciente: any) => {
        const dataCadastro = new Date(paciente.createdAt || paciente.dataCadastro);
        return dataCadastro >= periodo.inicio && dataCadastro <= periodo.fim;
      });
    }

    return {
      pacientes: dados,
      total: dados.length,
      estatisticas: this.calcularEstatisticasPacientes(dados)
    };
  }

  private async obterDadosConsultas(service: any, filtros?: any, periodo?: any): Promise<any> {
    let dados = await service.findAll();

    if (filtros) {
      dados = dados.filter((consulta: any) => {
        return Object.keys(filtros).every(key => {
          if (filtros[key] === undefined) return true;
          return consulta[key] === filtros[key];
        });
      });
    }

    if (periodo) {
      dados = dados.filter((consulta: any) => {
        const dataConsulta = new Date(consulta.dataConsulta || consulta.date);
        return dataConsulta >= periodo.inicio && dataConsulta <= periodo.fim;
      });
    }

    return {
      consultas: dados,
      total: dados.length,
      estatisticas: this.calcularEstatisticasConsultas(dados)
    };
  }

  private async obterDadosFaturas(service: any, filtros?: any, periodo?: any): Promise<any> {
    let dados = await service.findAll();

    if (filtros) {
      dados = dados.filter((fatura: any) => {
        return Object.keys(filtros).every(key => {
          if (filtros[key] === undefined) return true;
          return fatura[key] === filtros[key];
        });
      });
    }

    if (periodo) {
      dados = dados.filter((fatura: any) => {
        const dataFatura = new Date(fatura.dataEmissao || fatura.createdAt);
        return dataFatura >= periodo.inicio && dataFatura <= periodo.fim;
      });
    }

    return {
      faturas: dados,
      total: dados.length,
      valorTotal: dados.reduce((sum: number, fatura: any) => sum + (fatura.valor || 0), 0),
      estatisticas: this.calcularEstatisticasFaturas(dados)
    };
  }

  private async obterDadosEstoque(service: any, filtros?: any, periodo?: any): Promise<any> {
    const dados = await service.findAll();
    const estoqueBaixo = service.verificarEstoqueBaixo ? await service.verificarEstoqueBaixo() : [];

    return {
      produtos: dados,
      total: dados.length,
      estoqueBaixo: estoqueBaixo,
      alertas: estoqueBaixo.length,
      estatisticas: this.calcularEstatisticasEstoque(dados)
    };
  }

  private calcularEstatisticasPacientes(dados: any[]): any {
    return {
      totalPacientes: dados.length,
      porIdade: this.agruparPorIdade(dados),
      porGenero: this.agruparPorGenero(dados),
      cadastrosRecentes: dados.filter(p => {
        const cadastro = new Date(p.createdAt || p.dataCadastro);
        const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return cadastro >= umMesAtras;
      }).length
    };
  }

  private calcularEstatisticasConsultas(dados: any[]): any {
    return {
      totalConsultas: dados.length,
      porStatus: this.agruparPorStatus(dados),
      porMedico: this.agruparPorMedico(dados),
      porMes: this.agruparPorMes(dados)
    };
  }

  private calcularEstatisticasFaturas(dados: any[]): any {
    return {
      totalFaturas: dados.length,
      valorMedio: dados.length > 0 ? dados.reduce((sum, f) => sum + (f.valor || 0), 0) / dados.length : 0,
      porStatus: this.agruparPorStatusFatura(dados),
      faturamentoMensal: this.calcularFaturamentoMensal(dados)
    };
  }

  private calcularEstatisticasEstoque(dados: any[]): any {
    return {
      totalProdutos: dados.length,
      valorTotalEstoque: dados.reduce((sum, p) => sum + ((p.quantidade || 0) * (p.preco || 0)), 0),
      produtosEmFalta: dados.filter(p => (p.quantidade || 0) === 0).length,
      produtosEstoqueBaixo: dados.filter(p => (p.quantidade || 0) > 0 && (p.quantidade || 0) <= (p.estoqueMinimo || 5)).length
    };
  }

  // Métodos auxiliares para agrupamento
  private agruparPorIdade(dados: any[]): any {
    const grupos = { '0-18': 0, '19-35': 0, '36-60': 0, '60+': 0 };
    dados.forEach(p => {
      const idade = p.idade || 0;
      if (idade <= 18) grupos['0-18']++;
      else if (idade <= 35) grupos['19-35']++;
      else if (idade <= 60) grupos['36-60']++;
      else grupos['60+']++;
    });
    return grupos;
  }

  private agruparPorGenero(dados: any[]): any {
    return dados.reduce((acc, p) => {
      const genero = p.genero || 'Não informado';
      acc[genero] = (acc[genero] || 0) + 1;
      return acc;
    }, {});
  }

  private agruparPorStatus(dados: any[]): any {
    return dados.reduce((acc, c) => {
      const status = c.status || 'Não informado';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }

  private agruparPorMedico(dados: any[]): any {
    return dados.reduce((acc, c) => {
      const medico = c.medico || c.doctor || 'Não informado';
      acc[medico] = (acc[medico] || 0) + 1;
      return acc;
    }, {});
  }

  private agruparPorMes(dados: any[]): any {
    return dados.reduce((acc, c) => {
      const data = new Date(c.dataConsulta || c.date);
      const mes = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});
  }

  private agruparPorStatusFatura(dados: any[]): any {
    return dados.reduce((acc, f) => {
      const status = f.status || 'Não informado';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }

  private calcularFaturamentoMensal(dados: any[]): any {
    return dados.reduce((acc, f) => {
      const data = new Date(f.dataEmissao || f.createdAt);
      const mes = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[mes] = (acc[mes] || 0) + (f.valor || 0);
      return acc;
    }, {});
  }

  // Método original otimizarProcessos (mantido para compatibilidade)
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
    if (modulo === 'stock') return service.verificarEstoqueBaixo();
    // Adicione casos para outros módulos
    return {};
  }
}