import api, { isAxiosError, ApiError } from '../config';
import { Invoice, CreateInvoiceData, UpdateInvoiceData } from '../types';

export const invoiceApi = {
  list: async (params?: {
    type?: 'budget' | 'invoice';
    status?: string;
    search?: string;
  }): Promise<Invoice[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const response = await api.get<Invoice[]>(`/invoices?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao listar faturas');
    }
  },

  getById: async (id: string): Promise<Invoice> => {
    try {
      const response = await api.get<Invoice>(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar fatura');
    }
  },

  create: async (data: CreateInvoiceData): Promise<Invoice> => {
    try {
      const response = await api.post<Invoice>('/invoices', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar fatura');
    }
  },

  update: async (id: string, data: UpdateInvoiceData): Promise<Invoice> => {
    try {
      const response = await api.put<Invoice>(`/invoices/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar fatura');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/invoices/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar fatura');
    }
  },

  convertToInvoice: async (id: string): Promise<Invoice> => {
    try {
      const response = await api.post<Invoice>(`/invoices/${id}/convert`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao converter orçamento em fatura');
    }
  }
}; 