import { api } from '../config';
import { Questionnaire } from '../types/questionnaire';
import { questionService } from './question';

export const questionnaireService = {
  create: async (data: { category_id: number; name: string; description: string; estimated_time_seconds: number; is_active: boolean }) => {
    const response = await api.post('/questionnaires', data);
    return response.data;
  },
list: async (params?: { category_id?: number; is_active?: boolean }) => {
  const response = await api.get<{data: unknown[]}>(`/questionnaires`, { params }); // Adicionar tipo genérico
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray(response.data?.data)) { // Adicionar optional chaining
    return response.data.data;
  }
  return [];
},
get: async (id: string): Promise<Questionnaire> => {
  const response = await api.get<Questionnaire>(`/questionnaires/${id}`);
  return response.data;
},
delete: async (id: string) => { // Changed to string
  try {
    const questions = await questionService.listByQuestionnaire(id);
    if (questions && Array.isArray(questions)) {
      for (const question of questions) {
        await questionService.delete(question.id);
      }
    }
    
    const response = await api.delete(`/questionnaires/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar questionário:', error);
    throw error;
  }
},
};
export const deleteQuestionnaire = async (id: string): Promise<void> => {
  await api.delete(`/questionnaires/${id}`);
};