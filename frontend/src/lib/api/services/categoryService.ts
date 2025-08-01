import { api } from '../config';
import { Category, CategoryFilters, CategoryResponse } from '../types/category';

export const categoryService = {
  getAll: async (filters?: CategoryFilters): Promise<CategoryResponse> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<Category[]>(`/categories?${params.toString()}`);
    return {
      data: response.data,
      total: response.data.length
    };
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>): Promise<Category> => {
    const response = await api.post<Category>('/categories', category);
    return response.data;
  },

  update: async (id: string, category: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'isDefault'>>): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};