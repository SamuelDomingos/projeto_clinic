export interface Questionnaire {
  id: number;
  category_id: number;
  name: string;
  description: string;
  estimated_time_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
} 