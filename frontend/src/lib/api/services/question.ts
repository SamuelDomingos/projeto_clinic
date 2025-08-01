import { api } from '../config';

export const questionService = {
  create: async (data: { questionnaire_id: number; text: string; type: string; options: string[] | null; required: boolean; order: number }) => {
    const response = await api.post('/questions', data);
    return response.data;
  },
  listByQuestionnaire: async (questionnaire_id: number) => {
    const response = await api.get(`/questions/questionnaire/${questionnaire_id}`);
    console.log(response.data);
    
    return response.data;
  },
  get: async (id: number | string) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },
  update: async (id: number | string, data: { questionnaire_id: number; text: string; type: string; options: string[] | null; required: boolean; order: number }) => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },
  reorder: async (questionnaire_id: number, question_ids: number[]) => {
    const response = await api.put(`/questions/questionnaire/${questionnaire_id}/reorder`, { question_ids });
    return response.data;
  },
}; 