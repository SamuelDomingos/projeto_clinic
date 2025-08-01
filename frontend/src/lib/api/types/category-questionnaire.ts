export interface Category {
  id: string; // Alterado de number para string para corresponder ao UUID do backend
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}