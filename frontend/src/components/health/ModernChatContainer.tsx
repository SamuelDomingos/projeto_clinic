import React, { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { chatHistoryService } from "@/lib/api/services/chatHistory";
import { iaAnalysisService } from "@/lib/api/services/iaAnalysis";
import AIDiagnosticCard from "@/components/health/AIDiagnosticCard";
import StatsModal from "@/components/health/StatsModal";

interface Message {
  id: string;
  type: "user" | "ai";
  content: React.ReactNode | string;
  timestamp: Date;
}

interface ModernChatContainerProps {
  chatHistoryId: number | null;
  disabled?: boolean;
  onHistoryCreated?: (id: number) => void;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);
  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);
  return { textareaRef, adjustHeight };
}

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full px-4 py-3 resize-none bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/20 min-h-[60px]",
        className
      )}
      style={{ overflow: "hidden" }}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

const ModernChatContainer: React.FC<ModernChatContainerProps> = ({
  chatHistoryId,
  disabled = false,
  onHistoryCreated,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsData, setStatsData] = useState<Record<string, unknown> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('Mensagens antes do filtro/render:', messages);

  // Buscar histórico ao montar ou trocar de chat
  useEffect(() => {
    if (!chatHistoryId) return;
    const fetchChatHistory = async () => {
      const data = await chatHistoryService.getHistory(chatHistoryId);
      let msgs = data.messages;
      console.log('LOG [useEffect] chatHistoryId:', chatHistoryId);
      console.log('LOG [useEffect] Mensagens brutas do backend:', msgs);
      if (typeof msgs === 'string') {
        try { msgs = JSON.parse(msgs); } catch { msgs = []; }
      }
      if (Array.isArray(msgs)) {
        type MsgType = { role: string; type?: string; content?: string; id?: string | number; timestamp?: string; diagnostic_id?: string | number };
        console.log('LOG [useEffect] Mensagens para mapear:', msgs);
        // Monta todas as mensagens (usuário, IA, diagnóstico, estatística) em um único array, respeitando a ordem de timestamp
        const allMessages: Message[] = msgs.map((msg: MsgType, idx) => {
          // Diagnóstico
          if (msg.role === 'ai' && msg.type === 'diagnostic' && typeof msg.content === 'string' && !msg.content.trim().startsWith('{')) {
            return {
              id: msg.id ? String(msg.id) : `diagnostic-${idx}`,
              type: 'ai',
              content: <AIDiagnosticCard diagnostico={msg.content} />,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            } as Message;
          }
          // Estatística
          if (msg.role === 'ai' && msg.type === 'statistics') {
            return {
              id: `stats-btn-${msg.diagnostic_id || idx}`,
              type: 'ai',
              content: (
                <button
                  className="mb-2 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
                  onClick={() => {
                    let statsObjSafe: Record<string, unknown> = msg.content as unknown as Record<string, unknown>;
                    if (typeof msg.content === "string") {
                      try {
                        statsObjSafe = JSON.parse(msg.content);
                      } catch {
                        statsObjSafe = {};
                      }
                    }
                    setStatsData({ stats: statsObjSafe, questionMap: {} });
                    setShowStatsModal(true);
                  }}
                >
                  Ver Estatísticas Detalhadas
                </button>
              ),
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            } as Message;
          }
          // Usuário ou assistente
          if (msg.role === 'user' || msg.role === 'assistant') {
            return {
              id: msg.id ? String(msg.id) : `msg-${idx}`,
              type: msg.role === 'user' ? 'user' : 'ai',
              content: msg.content,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            } as Message;
          }
          return undefined;
        }).filter((m): m is Message => !!m);
        // Ordena por timestamp
        allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        console.log('LOG [useEffect] Mensagens mapeadas para setMessages:', allMessages);
        setMessages(allMessages);
      }
    };
    fetchChatHistory();
  }, [chatHistoryId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Enviar mensagem para IA
  const handleSendMessage = async (msg?: string) => {
    const content = msg || inputMessage.trim();
    if (!content) return;
    setInputMessage("");
    setIsTyping(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: "user",
        content,
        timestamp: new Date(),
      },
    ]);
    try {
      let historyId = chatHistoryId;
      // Se não houver histórico, cria um novo
      if (!historyId) {
        const res = await chatHistoryService.createHistory();
        if (res && res.chatHistoryId) {
          historyId = res.chatHistoryId;
          if (onHistoryCreated) onHistoryCreated(historyId);
        } else {
          setIsTyping(false);
          return;
        }
      }
      const result = await chatHistoryService.addMessage(historyId, {
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      });
      let msgs = result.messages;
      console.log('LOG [handleSendMessage] chatHistoryId:', historyId);
      console.log('LOG [handleSendMessage] Mensagens brutas do backend:', msgs);
      if (typeof msgs === 'string') {
        try { msgs = JSON.parse(msgs); } catch { msgs = []; }
      }
      if (Array.isArray(msgs)) {
        type MsgType = { role: string; type?: string; content?: string; id?: string | number; timestamp?: string; diagnostic_id?: string | number };
        console.log('LOG [handleSendMessage] Mensagens para mapear:', msgs);
        // Sempre reconstrua o array de mensagens completo, para garantir ordem e separação correta
        const allMessages: Message[] = msgs.map((msg: MsgType, idx) => {
          if (msg.role === 'ai' && msg.type === 'diagnostic' && typeof msg.content === 'string' && !msg.content.trim().startsWith('{')) {
            return {
              id: msg.id ? String(msg.id) : `diagnostic-${idx}`,
              type: 'ai',
              content: <AIDiagnosticCard diagnostico={msg.content} />,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            } as Message;
          }
          if (msg.role === 'ai' && msg.type === 'statistics') {
            return {
              id: `stats-btn-${msg.diagnostic_id || idx}`,
              type: 'ai',
              content: (
                <button
                  className="mb-2 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
                  onClick={() => {
                    let statsObjSafe: Record<string, unknown> = msg.content as unknown as Record<string, unknown>;
                    if (typeof msg.content === "string") {
                      try {
                        statsObjSafe = JSON.parse(msg.content);
                      } catch {
                        statsObjSafe = {};
                      }
                    }
                    setStatsData({ stats: statsObjSafe, questionMap: {} });
                    setShowStatsModal(true);
                  }}
                >
                  Ver Estatísticas Detalhadas
                </button>
              ),
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            } as Message;
          }
          if (msg.role === 'user' || msg.role === 'assistant') {
            return {
              id: msg.id ? String(msg.id) : `msg-${idx}`,
              type: msg.role === 'user' ? 'user' : 'ai',
              content: msg.content,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            } as Message;
          }
          return undefined;
        }).filter((m): m is Message => !!m);
        allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        console.log('LOG [handleSendMessage] Mensagens mapeadas para setMessages:', allMessages);
        setMessages(allMessages);
      }
    } catch (err) {
      console.error('LOG [handleSendMessage] Erro ao enviar mensagem:', err);
    } finally {
      setIsTyping(false);
    }
  };

  // Geração de diagnóstico e estatísticas
  const handleGenerateDiagnostics = async () => {
    if (!chatHistoryId) return;
    setIsTyping(true);
    setIsGenerating(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-typing-${Date.now()}`,
        type: "ai",
        content: "Gerando diagnóstico, por favor aguarde...",
        timestamp: new Date(),
      },
    ]);
    try {
      await iaAnalysisService.generateGeneral(chatHistoryId);
      const result = await iaAnalysisService.getByQuestionnaire("all");
      
      // Adiciona diagnóstico como card e botão de estatísticas se houver
      if (Array.isArray(result)) {
        result.forEach((diag, idx) => {
          if (diag.ia_diagnostic && typeof diag.ia_diagnostic === 'string') {
            const hasStats = !!(diag.analise?.ia_statistics || (diag as Record<string, unknown>).ia_statistics);
            const statsObj = diag.analise?.ia_statistics || (diag as Record<string, unknown>).ia_statistics;
            setMessages((prev) => [
              ...prev,
              {
                id: `diagnostic-${idx}-${Date.now()}`,
                type: "ai",
                content: (
                  <div>
                    <AIDiagnosticCard diagnostico={diag.ia_diagnostic} />
                    {hasStats && (
                      <button
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
                        onClick={() => {
                          let statsObjSafe: Record<string, unknown> = statsObj;
                          if (typeof statsObjSafe === "string") {
                            try {
                              statsObjSafe = JSON.parse(statsObjSafe);
                            } catch {
                              statsObjSafe = {};
                            }
                          }
                          setStatsData({ stats: statsObjSafe as Record<string, unknown>, questionMap: {} as Record<string, string> });
                          setShowStatsModal(true);
                        }}
                      >
                        Ver Estatísticas Detalhadas
                      </button>
                    )}
                  </div>
                ),
                timestamp: new Date(),
                messageType: "diagnostic",
              } as Message & { messageType: string },
            ]);
          }
        });
      }
    } catch (err) {
      // erro ao gerar diagnóstico
    } finally {
      setIsGenerating(false);
      setIsTyping(false);
    }
  };

  // Handler para AnimatedAIChat
  const handleAnimatedSendMessage = (msg: string) => {
    if (msg.trim()) {
      handleSendMessage(msg);
    }
  };

  useEffect(() => {
    console.log('StatsModal statsData:', statsData);
  }, [statsData]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto w-full px-0 sm:px-0 py-6 pb-6">
        <div className="w-full space-y-6">
          {messages
            .filter((message) =>
              message.type === "user" ||
              (message.type === "ai" &&
                // Não renderizar mensagens de erro ou JSON puro
                (!message.content || typeof message.content !== "string" ||
                  (!message.content.trim().startsWith("{") &&
                   !message.content.includes("Desculpe, não consegui processar sua pergunta")))
              )
            )
            .map((message) => {
              return (
                <div key={message.id} className={`flex gap-3 ${message.type === "user" ? "justify-end" : ""}`}>
                  {message.type === "ai" && (
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-4",
                      message.type === "user"
                        ? "bg-blue-600 text-white ml-auto"
                        : "bg-gray-700/50 text-gray-100 border border-gray-600/30"
                    )}
                  >
                    {typeof message.content === "string" ? (
                      <div className="prose-custom max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                    <div className="text-xs text-gray-500 mt-2">{message.timestamp.toLocaleTimeString()}</div>
                  </div>
                  {message.type === "user" && (
                    <div className="w-8 h-8 bg-gray-600/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
            
          {statsData && statsData.stats && (
            <StatsModal
              isOpen={showStatsModal}
              onClose={() => setShowStatsModal(false)}
              statsData={statsData as { stats: Record<string, unknown>; questionMap: Record<string, string> }}
            />
          )}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30">
                {/* Loading animado universal para mensagem, diagnóstico e plano de ação */}
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <div className="text-xs text-blue-300 mt-2">Pensando...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Rodapé: FloatingActionMenu + AnimatedAIChat integrados */}
      <div className="w-full max-w-2xl mx-auto flex flex-row items-end gap-3 sticky bottom-0 z-10">
        <div className="flex-1 relative">
          <AnimatedAIChat
            hideHeader={messages.length > 0}
            hideClipButton={true}
            onSendMessage={handleAnimatedSendMessage}
            onGenerateDiagnostics={handleGenerateDiagnostics}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default ModernChatContainer;