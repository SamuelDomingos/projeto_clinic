import { useState, useEffect } from "react"
import { iaAnalysisService, chatHistoryService } from "@/lib/api"

interface Message {
  id: string
  type: "user" | "ai"
  content: React.ReactNode
  timestamp: Date
}

interface BackendChatMessage {
  id?: string | number;
  role: string;
  content: string;
  timestamp?: string;
}

export const useIAChat = (iaAnalysisId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar histórico de chat ao montar/trocar análise
  useEffect(() => {
    if (!iaAnalysisId) return;
    const fetchChatHistory = async () => {
      const data = await chatHistoryService.getHistory(iaAnalysisId);
      let messages = data.messages;
      if (typeof messages === 'string') {
        try { messages = JSON.parse(messages); } catch { messages = []; }
      }
      if (Array.isArray(messages)) {
        setMessages(prev => {
          // Pegue as mensagens fixas (welcome, diagnóstico, estatísticas, etc)
          const staticMessages = prev.filter(
            m =>
              m.id === "welcome" ||
              m.id === "diagnostic-success" ||
              m.id === "diagnostic-stats" ||
              m.id === "diagnostic-content" ||
              m.id === "diagnostic-improvements" ||
              m.id === "diagnostic-recommendations" ||
              m.id.startsWith("action-plan-") || // Preservar mensagens de plano de ação
              m.id === "saved-action-plan" // Preservar plano de ação salvo
          );
          // Monte o histórico do chat
          const chatMessages = messages.map((msg: BackendChatMessage, idx: number) => ({
            id: msg.id ? String(msg.id) : `history-${idx}`,
            type: msg.role === 'user' ? 'user' as const : 'ai' as const,
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }));
          // Retorne as mensagens fixas seguidas do histórico do chat em ordem cronológica
          const sortedChatMessages = chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          return [...staticMessages, ...sortedChatMessages];
        });
      }
    };
    fetchChatHistory();
  }, [iaAnalysisId]);

  const sendMessage = async (content: string) => {
    if (!iaAnalysisId) {
      setError("ID da análise não disponível.");
      return;
    }

    setIsTyping(true);
    setError(null);

    try {
      const result = await chatHistoryService.addMessage(iaAnalysisId, {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      });

      let messages = result.messages;
      if (typeof messages === 'string') {
        try { messages = JSON.parse(messages); } catch { messages = []; }
      }
      
      if (Array.isArray(messages)) {
        setMessages(prev => {
          // Pegue as mensagens fixas (welcome, diagnóstico, estatísticas, etc)
          const staticMessages = prev.filter(
            m =>
              m.id === "welcome" ||
              m.id === "diagnostic-success" ||
              m.id === "diagnostic-stats" ||
              m.id === "diagnostic-content" ||
              m.id === "diagnostic-improvements" ||
              m.id === "diagnostic-recommendations" ||
              m.id.startsWith("action-plan-") || // Preservar mensagens de plano de ação
              m.id === "saved-action-plan" // Preservar plano de ação salvo
          );
          
          // Monte o histórico do chat
          const chatMessages = messages.map((msg: BackendChatMessage, idx: number) => ({
            id: msg.id ? String(msg.id) : `history-${idx}`,
            type: msg.role === 'user' ? 'user' as const : 'ai' as const,
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }));
          
          // Retorne as mensagens fixas seguidas do histórico do chat em ordem cronológica
          const sortedChatMessages = chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          return [...staticMessages, ...sortedChatMessages];
        });
      }
      
      // Adicionar um delay mínimo para garantir que o loading seja visível
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (err) {
      setError("Erro ao enviar mensagem. Tente novamente.");
      console.error(err);
    } finally {
      setIsTyping(false); // IA terminou de 'digitar'
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const setStaticMessages = (staticMessages: Message[] | ((prev: Message[]) => Message[])) => {
    setMessages(staticMessages);
  };

  // Permite sobrescrever todas as mensagens do chat
  const setAllMessages = (msgs: Message[]) => {
    setMessages(msgs);
  };

  return {
    messages,
    isTyping,
    error,
    setError,
    sendMessage,
    addMessage,
    setStaticMessages,
    setMessages: setAllMessages,
  };
}; 