"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  CheckCircle2,
  FileText,
  Brain,
  Heart,
  Utensils,
  Users,
  BarChart3,
  Bot,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ElegantBackground } from "@/components/ui/elegant-background";
import { useQuestionarioStatus } from "@/hooks/useQuestionarioStatus";
import { useEffect, useState } from "react";
import {
  questionnaireService,
  responseService,
  QuestionnaireStatistics,
} from "@/lib/api";
import { QuestionnaireStatsCard } from "@/components/health/QuestionnaireStatsCard";

type Questionnaire = {
  id: number | string;
  name: string;
  // outros campos se necessário
};

type ApiResponse<T> = { success: boolean; data: T };

const Painel = () => {
  const { status } = useQuestionarioStatus();

  const [questionnaireIds, setQuestionnaireIds] = useState<number[]>([]);
  const [stats, setStats] = useState<QuestionnaireStatistics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  console.log(stats);

  useEffect(() => {
    // Buscar todos os questionários existentes
    questionnaireService.list().then((questionarios: Questionnaire[]) => {
      const ids = questionarios.map((q) => Number(q.id));
      setQuestionnaireIds(ids);
    });
  }, []);

  useEffect(() => {
    setLoadingStats(true);
    responseService.getStatistics()
      .then((result) => {
        setStats(result); // Changed from result.data to result
      })
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false));
  }, []);

  // Cores predefinidas para cada card
  const cardColors = [
    ["#3B82F6", "#60A5FA", "#93C5FD"], // Azul
    ["#10B981", "#34D399", "#6EE7B7"], // Verde
    ["#F59E0B", "#FBBF24", "#FCD34D"], // Amarelo
    ["#8B5CF6", "#A78BFA", "#C4B5FD"], // Roxo
    ["#EC4899", "#F472B6", "#FBCFE8"], // Rosa
    ["#06B6D4", "#22D3EE", "#67E8F9"], // Cyan
  ];

  // Mock data para demonstração
  const mockMetrics = {
    totalQuestionarios: 11,
    completedQuestionarios: Object.keys(status).length,
    averageScore: 72,
    lastWeekProgress: 23,
    categories: [
      {
        id: "saude-mental",
        title: "Saúde Mental",
        icon: Brain,
        completed: 2,
        total: 3,
        avgScore: 68,
        trend: "up",
      },
      {
        id: "estilo-vida",
        title: "Estilo de Vida",
        icon: Heart,
        completed: 1,
        total: 3,
        avgScore: 78,
        trend: "up",
      },
      {
        id: "alimentacao",
        title: "Alimentação",
        icon: Utensils,
        completed: 0,
        total: 3,
        avgScore: 0,
        trend: "neutral",
      },
      {
        id: "sexualidade",
        title: "Sexualidade",
        icon: Users,
        completed: 1,
        total: 2,
        avgScore: 85,
        trend: "up",
      },
    ],
    recentActivity: [
      {
        type: "completed",
        questionnaire: "Questionário de Depressão",
        score: 65,
        date: "2024-01-15",
        category: "Saúde Mental",
      },
      {
        type: "completed",
        questionnaire: "Questionário de Ansiedade",
        score: 72,
        date: "2024-01-14",
        category: "Saúde Mental",
      },
      {
        type: "completed",
        questionnaire: "Questionário de Sono",
        score: 78,
        date: "2024-01-13",
        category: "Estilo de Vida",
      },
    ],
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <ElegantBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/health">
              <EnhancedButton variant="secondary" size="sm" icon="chevron">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </EnhancedButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Painel Administrativo
              </h1>
              <p className="text-gray-400">
                Dashboard completo com métricas e análises
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Coluna Principal - Métricas e Gráficos */}
          <div className="lg:col-span-3 space-y-6">

            <div className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm rounded-xl">
              <div className="p-6 border-b border-gray-700/50">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  Estatísticas Gerais dos Questionários
                </h3>
              </div>

              <div className="p-6">
                {loadingStats ? (
                  <div className="text-gray-400 text-center py-8">
                    Carregando estatísticas...
                  </div>
                ) : stats === null ? (
                  <div className="text-gray-400 text-center py-8">
                    Nenhuma estatística encontrada.
                  </div>
                ) : (
                  <QuestionnaireStatsCard
                    questionnaire_name="Todos os Questionários"
                    total_responses={stats?.total_responses || 0}
                    unique_employees={stats?.unique_employees || 0}
                    recent_responses_30_days={stats?.recent_responses_30_days || 0}
                    total_questions={stats?.total_questions || 0}
                    average_completion_rate={stats?.average_completion_rate || 0}
                    completion_rate_trend={stats?.completion_rate_trend || 'neutral'}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Coluna Lateral - Ações */}
          <div className="space-y-6">
            {/* Assistente IA */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  Assistente IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Converse com nossa IA para obter análises personalizadas,
                  planos de ação e insights sobre seu bem-estar.
                </p>
                <Link to="/health/ia">
                  <EnhancedButton className="w-full">
                    <Bot className="w-4 h-4 mr-2" />
                    Conversar com IA
                  </EnhancedButton>
                </Link>
              </CardContent>
            </Card>

            {/* Ação Rápida */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Gerenciamento</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/health/manager">
                  <EnhancedButton className="w-full" variant="secondary">
                    <Settings className="w-4 h-4 mr-2" />
                    Gerenciar Conteúdo
                  </EnhancedButton>
                </Link>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Criar e editar categorias e questionários
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Painel;
