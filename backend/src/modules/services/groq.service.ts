import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GroqService {
  private readonly groqApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.groqApiKey = this.configService.get<string>('GROQ_API_KEY') ?? '';
    if (!this.groqApiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }
  }

  async gerarQuestionarioIA(prompt: string): Promise<string> {
    const response = await this.httpService.axiosRef.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.choices[0].message.content;
  }

  async conversarComIA(mensagens: any[], contextoDiagnostico = ''): Promise<any> {
    try {
      const contextoPrompt = contextoDiagnostico
        ? `Contexto do diagnóstico: ${contextoDiagnostico}\n\n`
        : '';

      const messagesForAI = [
        {
          role: 'system',
          content: `${contextoPrompt}Você é uma assistente de bem-estar amigável e acolhedora. \
        Converse naturalmente com o usuário, como uma amiga que se preocupa com o bem-estar dele.\n\nCOMPORTAMENTO:\n- Seja conversacional e natural, não robótica\n- Responda de forma amigável e empática\n- Só forneça planos de ação quando o usuário especificamente pedir\n- Faça perguntas para entender melhor as necessidades\n- Ofereça dicas simples e práticas quando apropriado\n- Use linguagem acessível, não técnica demais\n\nCONTEXTO:\nVocê tem acesso aos dados de diagnóstico do usuário, mas só mencione quando relevante para a conversa.\nNão force informações técnicas se o usuário só quer conversar.\n\nFORMATAÇÃO:\nQuando gerar planos de ação (só quando pedido), use:\n- **texto em negrito** para títulos\n- - ou • para itens de lista\n- Espaçamento adequado entre seções\n- Sem emojis ou ícones`,
        },
        ...mensagens,
      ];

      const response = await this.httpService.axiosRef.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: messagesForAI,
          max_tokens: 1000,
          temperature: 0.8,
        },
        {
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Resposta inválida da API Groq');
      }

      return {
        success: true,
        content: data.choices[0].message.content,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        content: 'Desculpe, não consegui processar sua pergunta no momento. Tente novamente.',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
} 