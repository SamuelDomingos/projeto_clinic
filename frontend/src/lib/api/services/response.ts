import { api } from '../config';
import type { UserQuestionnaireResponse } from '../types/response';
import { AxiosError } from 'axios';

export const responseService = {
  submit: async (data: { employee_id: number; questionnaire_id: number; responses: { question_id: number; answer: string | string[] }[] }) => {
    const response = await api.post('/responses/submit', data);
    return response.data;
  },
  list: async (params?: { employee_id?: number; questionnaire_id?: number; start_date?: string; end_date?: string }) => {
    const response = await api.get('/responses', { params });
    return response.data;
  },
  get: async (id: number | string) => {
    const response = await api.get(`/responses/${id}`);
    return response.data;
  },
  getStatistics: async () => {
    const response = await api.get(`/responses/statistics`);
    return response.data;
  },
  getUserResponse: async (questionnaire_id: number, employee_id: number): Promise<UserQuestionnaireResponse | null> => {
    try {
      const response = await api.get(`/responses/by-user-questionnaire`, {
        params: { questionnaire_id, employee_id },
      });
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },
}; 