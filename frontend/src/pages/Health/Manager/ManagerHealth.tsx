"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  FolderPlus,
  FileText,
  Brain,
  Heart,
  Utensils,
  Users,
  Edit,
  Trash2,
  Eye,
  Sparkles,
  Zap,
  Shield,
  Activity,
  Smile,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ElegantBackground } from "@/components/ui/elegant-background";
import AIQuickCreator from "@/components/ui/ai-quick-creator";
import { categoryService, questionnaireService } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string | number;
  title?: string;
  name?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  questionarios?: { id: string | number; title?: string; }[];
  description?: string;
}

interface Questionnaire {
  id: string | number;
  title?: string;
  name?: string;
  description?: string;
  category_id?: string | number;
  category_name?: string;
  is_active?: boolean;
  questions_count?: number;
  // Adicione outros campos conforme necessário
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  heart: Heart,
  utensils: Utensils,
  users: Users,
  zap: Zap,
  shield: Shield,
  activity: Activity,
  smile: Smile,
};

const colorMap: Record<string, string> = {
  blue: "blue",
  green: "green",
  orange: "orange",
  purple: "purple",
  pink: "pink",
  yellow: "yellow",
  red: "red",
  cyan: "cyan",
};

const ManagerHealth = () => {
  const [activeTab, setActiveTab] = useState<"categories" | "questionnaires">(
    "categories"
  );
  const [showAICreator, setShowAICreator] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(false);
  const [errorQuestionnaires, setErrorQuestionnaires] = useState<string | null>(null);
  const { toast } = useToast();  
  
  useEffect(() => {
    setLoading(true);
    categoryService
      .list()
      .then((data) => {
        setCategories(data);
        setError(null);
      })
      .catch(() => setError("Erro ao carregar categorias"))
      .finally(() => setLoading(false));
  }, []);

  // Buscar questionários quando a aba for ativada
  useEffect(() => {
    if (activeTab === "questionnaires") {
      setLoadingQuestionnaires(true);
      questionnaireService
        .list()
        .then((data) => {
          setQuestionnaires(Array.isArray(data) ? data : []);
          setErrorQuestionnaires(null);
        })
        .catch(() => setErrorQuestionnaires("Erro ao carregar questionários"))
        .finally(() => setLoadingQuestionnaires(false));
    }
  }, [activeTab]);

  // Função para deletar categoria
  const handleDelete = async (id: string | number) => {
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast({
        title: "Categoria deletada com sucesso!",
        description: `A categoria foi removida.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao deletar categoria",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  // Função para deletar questionário
  const handleDeleteQuestionnaire = async (id: string | number) => {
    try {
      await questionnaireService.delete(id);
      setQuestionnaires((prev) => prev.filter((q) => q.id !== id));
      toast({
        title: "Questionário deletado com sucesso!",
        description: `O questionário foi removido.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao deletar questionário",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <ElegantBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/health/painel">
              <EnhancedButton variant="secondary" size="sm" icon="chevron">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Painel
              </EnhancedButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gerenciar Conteúdo
              </h1>
              <p className="text-gray-400">
                Gerencie categorias e questionários
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "categories"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
            }`}
          >
            <FolderPlus className="w-4 h-4 inline mr-2" />
            Categorias
          </button>
          <button
            onClick={() => setActiveTab("questionnaires")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === "questionnaires"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Questionários
          </button>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "categories" ? (
            <div>
              {/* Header da seção */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Gerenciar Categorias
                </h2>
                <div className="flex gap-3">
                  <Link to="/health/category/new">
                    <EnhancedButton>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Categoria
                    </EnhancedButton>
                  </Link>
                </div>
              </div>

              {/* Grid de categorias */}
              {loading ? (
                <div className="text-center text-gray-400 py-12">Carregando categorias...</div>
              ) : error ? (
                <div className="text-center text-red-400 py-12">{error}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const iconName = typeof category.icon === 'string' ? category.icon : 'brain';
                    const IconComponent = iconMap[iconName] || Brain;
                    const color = colorMap[category.color as string] || "blue";
                    return (
                      <Card
                        key={category.id}
                        className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                                <IconComponent className={`w-5 h-5 text-${color}-400`} />
                              </div>
                              <div>
                                <CardTitle className="text-lg text-white">{category.title || category.name}</CardTitle>
                                <CardDescription className="text-sm">
                                  {category.description || "Sem descrição."}
                                </CardDescription>
                                <CardDescription className="text-xs text-gray-400">
                                  {category.questionarios ? category.questionarios.length : 0} questionários
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex gap-2">
                            <Link to={`/health/category/${category.id}`} className="flex-1">
                              <button className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
                                <Edit className="w-3 h-3 inline mr-1" />
                                Editar
                              </button>
                            </Link>
                            <button
                              className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Header da seção */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Gerenciar Questionários
                </h2>
                <div className="flex gap-3">
                  {/* Botão de Criação Rápida com IA - Design melhorado */}
                  <button
                    onClick={() => setShowAICreator(true)}
                    className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl text-white transition-all duration-300 hover:from-purple-600/30 hover:to-pink-600/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"
                  >
                    <div className="relative">
                      <Sparkles className="w-5 h-5 text-purple-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                      <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">
                        Criação Rápida IA
                      </div>
                      <div className="text-xs text-purple-300/80 group-hover:text-purple-200">
                        Gere em segundos
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <Link to="/health/question/new">
                    <EnhancedButton>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Questionário
                    </EnhancedButton>
                  </Link>
                </div>
              </div>

              {/* Lista de questionários */}
              {loadingQuestionnaires ? (
                <div className="text-center text-gray-400 py-12">Carregando questionários...</div>
              ) : errorQuestionnaires ? (
                <div className="text-center text-red-400 py-12">{errorQuestionnaires}</div>
              ) : questionnaires.length === 0 ? (
                <div className="space-y-4 text-center text-gray-400 py-12">
                  Nenhum questionário cadastrado.
                </div>
              ) : (
                <div className="space-y-4">
                  {questionnaires.map((questionnaire) => (
                    <Card key={questionnaire.id} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{questionnaire.title || questionnaire.name}</h3>
                              <Badge
                                className={`text-xs ${
                                  questionnaire.is_active
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                }`}
                              >
                                {questionnaire.is_active ? "ativo" : "rascunho"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>Categoria: {questionnaire.category_name || "Sem categoria"}</span>
                              <span>•</span>
                              <span>{questionnaire.questions_count ?? 0} perguntas</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/health/question/${questionnaire.id}`}>
                              <button className="px-3 py-2 bg-gray-600/20 text-gray-400 rounded-lg hover:bg-gray-600/30 transition-colors text-sm">
                                <Eye className="w-3 h-3 inline mr-1" />
                                Visualizar
                              </button>
                            </Link>
                            <Link to={`/health/question/${questionnaire.id}/edit`}>
                              <button className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
                                <Edit className="w-3 h-3 inline mr-1" />
                                Editar
                              </button>
                            </Link>
                            <button
                              className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                              onClick={() => handleDeleteQuestionnaire(questionnaire.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação Rápida com IA */}
      <AIQuickCreator
        isOpen={showAICreator}
        onClose={() => setShowAICreator(false)}
        onQuestionarioCreated={(questionario) => {
          console.log("Questionário criado:", questionario);
          // Aqui você pode adicionar lógica para salvar o questionário
          // Por exemplo, redirecionar para a página de edição ou adicionar à lista
          setShowAICreator(false);
        }}
      />
    </div>
  );
};

export default ManagerHealth;
