import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from './entities/questionnaire.entity';
import { QuestionsService } from '../questions/questions.service';
import { gerarQuestionarioIA } from '../../services/groq.service';

@Injectable()
export class QuestionnairesService {
  constructor(
    @InjectRepository(Questionnaire)
    private readonly repo: Repository<Questionnaire>,
    private readonly questionsService: QuestionsService,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {  // Ensure this matches the entity's ID type
    const questionnaire = await this.repo.findOneBy({ id });
    if (!questionnaire) return null;
  
    const questions = await this.questionsService.findByQuestionnaire(id);
    return {
      ...questionnaire,
      questions
    };
  }

  // Also update these methods:
  update(id: string, data: Partial<Questionnaire>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  create(data: Partial<Questionnaire>) {
    return this.repo.save(this.repo.create(data));
  }

  // Função para gerar questionário com IA (igual ao video-vibe-landing)
  async gerarQuestionarioComIA(prompt: string, category_id?: string) {
    try {
      if (!prompt) {
        return { error: 'Envie o prompt.' };
      }

      // NÃO validar category_id aqui - será usado apenas na criação final

      // Instrução extra para garantir resposta em JSON no formato correto dos modelos
      const instrucaoJSON = `\nResponda apenas em JSON, no seguinte formato:\n{\n  "name": "Título do questionário",\n  "description": "Descrição do questionário",\n  "questions": [\n    {\n      "question_text": "Pergunta 1",\n      "question_type": "single_choice | multiple_choice | text_free | star_rating | numeric",\n      // Inclua apenas os campos relevantes para o tipo de pergunta escolhido\n      // Exemplo: "options" para escolhas, "min_value"/"max_value" para avaliações ou números\n    }\n  ]\n}\nAtenção:\n- Crie perguntas e tipos de acordo com o contexto e a necessidade do usuário, sem seguir uma ordem ou quantidade fixa de tipos.\n- Use apenas os campos necessários para cada tipo de pergunta.\n- Não escreva explicações, apenas o JSON.`;

      const promptFinal = `${prompt}\n${instrucaoJSON}`;

      // Chama a IA para gerar o questionário
      const respostaIA = await gerarQuestionarioIA(promptFinal);

      // Antes de fazer o JSON.parse:
      let respostaLimpa = respostaIA.trim();

      // Remove blocos de código Markdown (```json ... ```)
      if (respostaLimpa.startsWith('```')) {
        respostaLimpa = respostaLimpa
          .replace(/```(?:json)?/gi, '')
          .replace(/```/g, '')
          .trim();
      }

      let questionarioGerado;
      try {
        questionarioGerado = JSON.parse(respostaLimpa);
      } catch (e) {
        console.error(
          'Erro ao fazer parse do JSON:',
          e,
          'Resposta da IA:',
          respostaIA,
        );
        return {
          error: 'A resposta da IA não está em formato JSON válido.',
          respostaIA,
        };
      }

      // NÃO adicionar category_id aqui - será adicionado apenas na criação final

      // Retorna o questionário gerado para o frontend (não salva ainda)
      return { questionario_gerado: questionarioGerado };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return {
        error: 'Erro ao gerar questionário com IA',
        detalhes: error.message,
      };
    }
  }
}
