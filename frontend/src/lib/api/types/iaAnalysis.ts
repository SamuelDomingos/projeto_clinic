export interface IAAnalysis {
  id: number;
  questionnaire_id: number | null;
  responses_snapshot: unknown;
  ia_statistics: unknown;
  ia_diagnostic: string;
  ia_action_plan?: string;
  ia_conversation_history?: unknown;
  perguntasComRespostas?: unknown;
  created_at: string;
  updated_at?: string;
}

export type IAAnalysisEventType = 'diagnostic' | 'statistics' | 'action_plan' | 'message';

export interface IAAnalysisEvent {
  type: IAAnalysisEventType;
  content: unknown;
  timestamp: string;
  role?: string; // para mensagens
} 