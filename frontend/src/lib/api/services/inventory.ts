import api, { isAxiosError, ApiError } from '../config';
import { Product, StockLocation, StockMovement } from '../types';

export const inventoryApi = {
  // Criar novo produto
  createProduct: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'StockLocations' | 'totalQuantity' | 'inventoryStatus'> & {
    initialLocation?: string;
    initialQuantity?: number;
    initialExpiryDate?: string | null;
  }): Promise<Product> => {
    try {
      const response = await api.post<Product>('/inventory/products', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar produto');
    }
  },

  // Listar produtos com estoque
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/inventory/products');
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar produtos');
    }
  },

  // Adicionar estoque
  addStock: async (data: {
    productId: string;
    location: string;
    quantity: number;
    expiryDate?: string;
  }): Promise<StockLocation> => {
    try {
      const response = await api.post<StockLocation>('/inventory/stock/add', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao adicionar estoque');
    }
  },

  // Remover estoque
  removeStock: async (data: {
    productId: string;
    location: string;
    quantity: number;
    reason: string;
  }): Promise<StockLocation> => {
    try {
      const response = await api.post<StockLocation>('/inventory/stock/remove', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao remover estoque');
    }
  },

  // Transferir estoque
  transferStock: async (data: {
    productId: string;
    fromLocation: string;
    toLocation: string;
    quantity: number;
    reason: string;
  }): Promise<{ fromStock: StockLocation; toStock: StockLocation }> => {
    try {
      const response = await api.post<{ fromStock: StockLocation; toStock: StockLocation }>(
        '/inventory/stock/transfer',
        data
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao transferir estoque');
    }
  },

  // Listar movimentações de um produto
  getMovements: async (productId: string): Promise<StockMovement[]> => {
    try {
      const response = await api.get<StockMovement[]>(`/inventory/movements/${productId}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar movimentações');
    }
  },

  deleteMovement: async (movementId: string): Promise<void> => {
    try {
      await api.delete(`/inventory/movements/${movementId}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar movimentação');
    }
  },

  updateMovement: async (movementId: string, data: { quantity: number; reason: string; location: string }): Promise<StockMovement> => {
    try {
      const response = await api.put<StockMovement>(`/inventory/movements/${movementId}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar movimentação');
    }
  }
}; 