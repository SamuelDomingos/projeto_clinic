import { api } from '../config';

export const categoryService = {
  create: async (data: { name: string; description: string; icon: string; color: string }) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/categories');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data.categories)) {
      return response.data.categories;
    }
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data && typeof response.data === 'object' && response.data.id) {
      return [response.data];
    }
    return [];
  },
  get: async (id: number | string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  update: async (id: number | string, data: { name: string; description: string; icon: string; color: string }) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
}; 