import { User, Supplier } from './common';

export interface StockLocation {
  id: string;
  productId: string;
  location: string;
  quantity: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  reason: string;
  location: string;
  userId: string;
  notes?: string;
  sku?: string;
  price?: number;
  expiryDate?: string;
  supplierId?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  supplier?: Supplier;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  unit: string;
  category: string;
  minimumStock: number;
  productStatus: 'active' | 'inactive';
  specifications: Record<string, string | number | boolean>;
  totalQuantity: number;
  inventoryStatus: 'normal' | 'low' | 'out' | 'expiring';
  StockLocations?: StockLocation[];
  createdAt: string;
  updatedAt: string;
} 