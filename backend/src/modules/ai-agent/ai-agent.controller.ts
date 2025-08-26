import { Controller, Post, Body } from '@nestjs/common';
import { AIAgentService } from './ai-agent.service';

@Controller('ai-agent')
export class AIAgentController {
  constructor(private readonly aiAgentService: AIAgentService) {}

  @Post('otimizar')
  async otimizar(@Body() data: { tarefa: string; contextoGlobal: any }) {
    const { tarefa, contextoGlobal } = data;
    return this.aiAgentService.otimizarProcessos(tarefa, contextoGlobal);
  }
}