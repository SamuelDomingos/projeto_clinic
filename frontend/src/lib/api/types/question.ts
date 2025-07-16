export interface Question {
  id: number;
  questionnaire_id: number;
  text: string;
  type: string;
  options: string[] | null;
  required: boolean;
  order: number;
} 