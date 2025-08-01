import api, { isAxiosError, ApiError } from '../config';
import { User, CreateUserData, UpdateUserData } from '../types';

export const userApi = {
  list: async (params?: { role?: string }): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/users', { params });
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao listar usuários');
    }
  },

  getById: async (id: string): Promise<User> => {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar usuário');
    }
  },

  create: async (data: CreateUserData): Promise<User> => {
    try {
      const response = await api.post<User>('/users', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar usuário');
    }
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    try {
      // Garantir que as permissões sejam enviadas como array
      const formattedData = {
        ...data,
        permissions: Array.isArray(data.permissions) ? data.permissions : []
      };
      const response = await api.put<User>(`/users/${id}`, formattedData);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar usuário');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar usuário');
    }
  }
}; 