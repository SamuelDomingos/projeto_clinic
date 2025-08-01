import api, { isAxiosError, ApiError } from '../config';
import { PaymentMethod } from '../types';

export const paymentMethodApi = {
  list: async (): Promise<PaymentMethod[]> => {
    try {
      const response = await api.get<PaymentMethod[]>('/payment-methods');
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao listar métodos de pagamento');
    }
  },

  getById: async (id: string): Promise<PaymentMethod> => {
    try {
      const response = await api.get<PaymentMethod>(`/payment-methods/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar método de pagamento');
    }
  },

  getByType: async (type: string): Promise<PaymentMethod[]> => {
    try {
      const response = await api.get<PaymentMethod[]>(`/payment-methods/type/${type}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar métodos de pagamento por tipo');
    }
  },

  create: async (data: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> => {
    try {
      const response = await api.post<PaymentMethod>('/payment-methods', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar método de pagamento');
    }
  },

  update: async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    try {
      const response = await api.put<PaymentMethod>(`/payment-methods/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar método de pagamento');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/payment-methods/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar método de pagamento');
    }
  }
}; 