export interface UserQuestionnaireResponse {
  id: string;
  questionnaire_id: string;
  employee_id: string;
  responses: { question_id: string; answer: string | string[] }[];
  submitted_at: string;
}