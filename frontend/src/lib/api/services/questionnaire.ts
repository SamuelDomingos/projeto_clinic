import { api } from '../config';

export const questionnaireService = {
  create: async (data: { category_id: number; name: string; description: string; estimated_time_seconds: number; is_active: boolean }) => {
    const response = await api.post('/questionnaires', data);
    return response.data;
  },
  list: async (params?: { category_id?: number; is_active?: boolean }) => {
    const response = await api.get('/questionnaires', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },
  get: async (id: number | string) => {
    const response = await api.get(`/questionnaires/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  update: async (id: number | string, data: { category_id: number; name: string; description: string; estimated_time_seconds: number; is_active: boolean }) => {
    const response = await api.put(`/questionnaires/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await api.delete(`/questionnaires/${id}`);
    return response.data;
  },
}; 