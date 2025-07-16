import { api } from '../config';
import type { IAAnalysis, IAAnalysisEvent } from '../types/iaAnalysis';

export const iaAnalysisService = {
  generate: async (questionnaireIds: (number | string)[]) => {
    const response = await api.post(`/ia-analysis/questionnaire`, { questionnaireIds });
    return response.data;
  },
  getByQuestionnaire: async (questionnaireId: number | string) => {
    const response = await api.get(`/ia-analysis/questionnaire/${questionnaireId}`);
    return response.data;
  },
  getById: async (id: number | string) => {
    const response = await api.get(`/ia-analysis/${id}`);
    return response.data;
  },
  generateGeneral: async (chatHistoryId?: number) => {
    const response = await api.post(`/ia-analysis/questionnaire/all`, { chat_history_id: chatHistoryId });
    return response.data;
  },
  generateActionPlan: async (id: number | string, mensagem: string, contexto: { estatisticas: unknown, diagnostico: unknown }) => {
    const response = await api.post(`/ia-analysis/${id}/gerar-plano-acao`, { mensagem, contexto });
    return response.data;
  },
}; 