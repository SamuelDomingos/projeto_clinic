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
      const response = await api.post<Product>('/products', data);
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
      const response = await api.get<Product[]>('/products');
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar produtos');
    }
  },

  // Buscar produto específico com localizações
  getProduct: async (productId: string): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/${productId}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar produto');
    }
  },

  // Adicionar estoque
  addStock: async (data: {
    productId: string;
    locationId?: string;
    locationName?: string;
    quantity: number;
    expiryDate?: string;
    supplierId?: string;
    sku?: string;
    price?: number;
  }): Promise<StockLocation> => {
    try {
      const response = await api.post<StockLocation>('/stock-movements', { ...data, type: 'in' });
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
    locationId: string;
    quantity: number;
    reason: string;
  }): Promise<StockLocation> => {
    try {
      const response = await api.post<StockLocation>('/stock-movements', { ...data, type: 'out' });
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
    fromLocationId: string;
    toLocationId: string;
    quantity: number;
    reason: string;
  }): Promise<{ fromStock: StockLocation; toStock: StockLocation }> => {
    try {
      const response = await api.post<{ fromStock: StockLocation; toStock: StockLocation }>(
        '/stock-movements',
        { ...data, type: 'transfer' }
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
      const response = await api.get<StockMovement[]>(`/stock-movements?productId=${productId}`);
      
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
      await api.delete(`/stock-movements/${movementId}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar movimentação');
    }
  },

  updateMovement: async (movementId: string, data: { quantity: number; reason: string; location: string }): Promise<StockMovement> => {
    try {
      const response = await api.put<StockMovement>(`/stock-movements/${movementId}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar movimentação');
    }
  }
}; 