export interface UserQuestionnaireResponse {
  id: number;
  questionnaire_id: number;
  employee_id: number;
  responses: { question_id: number; answer: string | string[] }[];
  submitted_at: string;
} 