export type CategoryType = 'revenue' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  type?: CategoryType;
  search?: string;
}

export interface CategoryResponse {
  data: Category[];
  total: number;
} 