"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bot } from "lucide-react";
import { ElegantBackground } from "@/components/ui/elegant-background";
import { iaAnalysisService } from "@/lib/api/services/iaAnalysis";
import { chatHistoryService } from "@/lib/api/services/chatHistory";


import AIDiagnosticCard from "@/components/health/AIDiagnosticCard";
import ActionPlanModal from "@/components/health/ActionPlanModal";
import StatsModal from "@/components/health/StatsModal";
import ChatSidebar from "@/components/health/ChatSidebar";
import ModernChatContainer from "@/components/health/ModernChatContainer";

interface Message {
  id: string;
  type: "user" | "ai";
  content: React.ReactNode;
  timestamp: Date;
  analysis?: {
    insights?: string[];
    recommendations?: string[];
    score?: number;
  };
}

interface IAContext {
  estatisticas: Record<string, unknown>;
  diagnostico: string;
}

// Tipo para diagnóstico retornado pela API
interface DiagnosticResult {
  id?: number;
  questionnaireId: number;
  created_at?: string;
  ia_diagnostic?: string;
  ia_action_plan?: string | unknown;
  analise?: {
    id: number;
    questionnaire_id: number;
    responses_snapshot: unknown[];
    ia_statistics: Record<string, unknown>;
    ia_diagnostic: string;
    ia_action_plan: string | unknown;
    ia_conversation_history: unknown;
    created_at: string;
  };
  error?: string;
}

// Tipos explícitos para perguntas e estatísticas
interface PerguntaComRespostas {
  question_id: number;
  order_index: number;
  question_text: string;
  question_type: string;
  options: string | null;
  responses?: (string | number | string[] | number[])[];
}

interface EstatisticasIA {
  distribuicao_respostas?: Record<string, Record<string, number>>;
  media_respostas_numericas?: Record<string, number>;
  respostas_texto?: Record<string, string>;
}


const IAPage = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagnostics, setDiagnostics] = useState([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [showActionPlanModal, setShowActionPlanModal] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [chatHistories, setChatHistories] = useState([]);
  const [chatHistoryId, setChatHistoryId] = useState(null);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const res = await chatHistoryService.listHistories();
        setChatHistories(res.histories || []);
        if ((res.histories || []).length > 0 && !chatHistoryId) {
          setChatHistoryId(res.histories[0].id);
        }
      } catch (err) {
        setChatHistories([]);
      }
    };
    fetchHistories();
  }, []);

  const handleCreateNewHistory = async () => {
    try {
      const res = await chatHistoryService.createHistory();
      if (res && res.chatHistoryId) {
        setChatHistories((prev) => [
          ...prev,
          { id: res.chatHistoryId, created_at: new Date().toISOString() },
        ]);
        setChatHistoryId(res.chatHistoryId);
      }
    } catch (err) {
      // erro ao criar novo histórico
    }
  };

  useEffect(() => {
    const fetchAllDiagnostics = async () => {
      try {
        const result = await iaAnalysisService.getByQuestionnaire("all");
        if (Array.isArray(result)) {
          setDiagnostics(result);
        } else if (result) {
          setDiagnostics([result]);
        } else {
          setDiagnostics([]);
        }
      } catch (err) {
        setDiagnostics([]);
      }
    };
    fetchAllDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 relative flex flex-row">
      <ElegantBackground />
      <ChatSidebar
        chatHistories={chatHistories}
        chatHistoryId={chatHistoryId}
        onSelect={setChatHistoryId}
        onCreate={handleCreateNewHistory}
      />
      <div className="flex-1 ml-64 relative z-10 container mx-auto px-4 py-8">
        <div className="w-full flex justify-center items-center py-4">
          <img
            src="/lovable-uploads/infinity-way-logo.png"
            alt="Logo"
            style={{ maxHeight: 60 }}
          />
        </div>
        <StatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          statsData={statsData}
        />
        <ActionPlanModal
          isOpen={showActionPlanModal}
          onClose={() => setShowActionPlanModal(false)}
          onConfirm={() => {}}
          selectedDiagnostic={selectedDiagnostic}
          setSelectedDiagnostic={setSelectedDiagnostic}
          diagnostics={diagnostics}
        />
        <div className="flex items-center gap-4 mb-8">
          <Link to="/health/painel">
            <button className="btn-secondary btn-sm flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Painel
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-400" />
              Assistente IA de Bem-estar
            </h1>
            <p className="text-gray-400">
              Converse comigo para análises personalizadas e planos de ação
            </p>
          </div>
        </div>
        {diagnostics &&
          diagnostics
            .filter((d) => !!d.ia_diagnostic)
            .map((d) => (
              <div key={d.id} className="mb-4">
                <AIDiagnosticCard diagnostico={d.ia_diagnostic} />
                {((d as unknown as { ia_statistics?: unknown }).ia_statistics ||
                  d.analise?.ia_statistics) && (
                  <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
                    onClick={() => {
                      let statsObj =
                        (d as unknown as { ia_statistics?: unknown })
                          .ia_statistics || d.analise?.ia_statistics;
                      if (typeof statsObj === "string") {
                        try {
                          statsObj = JSON.parse(statsObj);
                        } catch {
                          /* ignore */
                        }
                      }
                      const statsObjSafe: Record<string, unknown> =
                        statsObj && typeof statsObj === "object"
                          ? (statsObj as Record<string, unknown>)
                          : {};
                      const questionMap =
                        d.analise &&
                        (
                          d.analise as {
                            perguntasComRespostas?: PerguntaComRespostas[];
                          }
                        ).perguntasComRespostas
                          ? buildQuestionMap(
                              d.analise as {
                                perguntasComRespostas?: PerguntaComRespostas[];
                              }
                            )
                          : {};
                      setStatsData({ stats: statsObjSafe, questionMap });
                      setShowStatsModal(true);
                    }}
                  >
                    Ver Estatísticas Detalhadas
                  </button>
                )}
              </div>
            ))}
        <div className="lg:col-span-3">
          <ModernChatContainer chatHistoryId={chatHistoryId} />
        </div>
      </div>
    </div>
  );
};

export default IAPage;
