import api, { isAxiosError, ApiError } from '../config';
import { Supplier } from '../types';

export const getSuppliers = async (params?: { name?: string; category?: string; status?: string }): Promise<Supplier[]> => {
  try {
    const response = await api.get<Supplier[]>('/suppliers', { params });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error((error.response.data as ApiError).error);
    }
    throw new Error('Erro ao buscar fornecedores');
  }
};

export const supplierApi = {
  getSuppliers,
  createSupplier: async (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> => {
    try {
      const response = await api.post<Supplier>('/suppliers', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar fornecedor');
    }
  },

  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    try {
      const response = await api.put<Supplier>(`/suppliers/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar fornecedor');
    }
  },

  deleteSupplier: async (id: string): Promise<void> => {
    try {
      await api.delete(`/suppliers/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar fornecedor');
    }
  },

  updateSupplierStatus: async (id: string, status: 'active' | 'inactive'): Promise<Supplier> => {
    try {
      const response = await api.put<Supplier>(`/suppliers/${id}/status`, { status });
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar status do fornecedor');
    }
  }
}; 