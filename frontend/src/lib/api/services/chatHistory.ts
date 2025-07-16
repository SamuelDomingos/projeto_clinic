import { api } from '../config';

export const chatHistoryService = {
  // Buscar histórico de conversa por chat_history_id
  getHistory: async (chat_history_id: number) => {
    const res = await api.get(`/chat-history/${chat_history_id}`);
    return res.data;
  },
  // Adicionar mensagem ao histórico de conversa por chat_history_id
  addMessage: async (chat_history_id: number, message: { role: string, content: string, timestamp?: string, type?: string, diagnostic_id?: number }) => {
    const res = await api.post(`/chat-history/${chat_history_id}`, { message });
    return res.data;
  },
  // Criar novo histórico de conversa
  createHistory: async () => {
    const res = await api.post(`/chat-history`, {});
    return res.data;
  },
  // Listar históricos do usuário
  listHistories: async () => {
    // Ajuste para GET /chat-history se não houver /user
    const res = await api.get(`/chat-history`);
    return res.data;
  },
  // Adicionar evento de diagnóstico (mantém para compatibilidade)
  addDiagnosticEvent: async (diagnostic_id: number, content: string, timestamp?: string) => {
    const res = await api.post(`/chat-history`, {
      message: {
        type: 'diagnostic',
        diagnostic_id,
        content,
        timestamp: timestamp || new Date().toISOString(),
      }
    });
    return res.data;
  },
  // Buscar histórico completo (todos os eventos)
  getFullHistory: async () => {
    const response = await api.get(`/chat-history/full-history`);
    return response.data.events;
  },
}; 