import { 
  Controller, 
  Post, 
  Body, 
  BadRequestException, 
  InternalServerErrorException, 
  Logger 
} from '@nestjs/common';
import { AIAgentService } from './ai-agent.service';

@Controller('ai-agent')
export class AIAgentController {
  private readonly logger = new Logger(AIAgentController.name);

  constructor(private readonly aiAgentService: AIAgentService) {}

  @Post('query')
  async processQuery(
    @Body() body: { question: string; sessionId?: string }
  ): Promise<any> {
    const { question, sessionId = 'default' } = body;
    
    if (!question || question.trim().length === 0) {
      throw new BadRequestException('Pergunta é obrigatória');
    }
    
    try {
      const result = await this.aiAgentService.processNaturalLanguageQueryWithContext(
        question.trim(),
        sessionId
      );
      
      return {
        success: true,
        data: result,
        message: 'Consulta processada com sucesso'
      };
    } catch (error) {
      this.logger.error('Erro no processamento da consulta:', error);
      throw new InternalServerErrorException({
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}