import { api } from '../config';
import type { IAAnalysis, IAAnalysisEvent } from '../types/iaAnalysis';

export const iaAnalysisService = {
  generate: async (prompt: string, category_id?: string) => {
    const response = await api.post(`/questionnaires/gerar-com-ia`, { 
      prompt,
      category_id 
    });
    return response.data;
  },
  getByQuestionnaire: async (questionnaireId: number | string) => {
    const response = await api.get(`/ia-analyses/questionnaire/${questionnaireId}`);
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await api.get(`/ia-analyses/${id}`);
    return response.data;
  },
  generateGeneral: async (chatHistoryId?: number) => {
    const response = await api.post(`/ia-analyses/questionnaire/all`, { chat_history_id: chatHistoryId });
    return response.data;
  },
  generateActionPlan: async (id: number | string, mensagem: string, contexto: { estatisticas: unknown, diagnostico: unknown }) => {
    const response = await api.post(`/ia-analyses/${id}/gerar-plano-acao`, { mensagem, contexto });
    return response.data;
  },
};