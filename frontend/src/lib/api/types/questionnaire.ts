export interface Questionnaire {
  id: string; // Changed from number to string
  category_id: number;
  name: string;
  description: string;
  estimated_time_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions?: Question[]; // Optional questions array
}