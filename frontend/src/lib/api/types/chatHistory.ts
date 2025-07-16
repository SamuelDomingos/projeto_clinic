export interface ChatMessage {
  id?: string | number;
  role: string;
  content: string;
  timestamp?: string;
} 