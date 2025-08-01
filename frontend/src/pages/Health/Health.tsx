"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Heart,
  Utensils,
  Users,
  CheckCircle,
  BarChart3,
  Zap,
  Shield,
  Activity,
  Smile,
  LucideIcon,
} from "lucide-react";
import { ElegantBackground } from "@/components/ui/elegant-background";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import CleanSearchBar from "@/components/ui/clean-search-bar";
import DigitalHealthTitle from "@/components/ui/digital-health-title";
import { useQuestionarioStatus } from "@/hooks/useQuestionarioStatus";
import { Link, useNavigate } from "react-router-dom";
import { categoryService, responseService} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Category } from "@/lib/api/types/category-questionnaire";

// A interface local 'Category' foi removida para usar a importada, que é a fonte da verdade.

const iconMap: Record<string, LucideIcon> = {
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

export default function Health() {
  const { isCompleted, getCategoryProgress } = useQuestionarioStatus();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [respondidos, setRespondidos] = useState<{ [key: string]: boolean }>(
    {}
  );



  useEffect(() => {
    if (user?.id && categories.length > 0) {
      const fetchAll = async () => {
        const newRespondidos: { [key: string]: boolean } = {};
        for (const category of categories) {
          if (Array.isArray(category.questions)) {
            await Promise.all(
              category.questions.map(async (q) => {
                const resp = await responseService.getUserResponse(
                  Number(q.id),
                  user.id
                );
                newRespondidos[String(q.id)] = !!resp;
              })
            );
          }
        }
        setRespondidos(newRespondidos);
      };
      fetchAll();
    }
  }, [categories, user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesData = await categoryService.list(true); // Inclui questions diretamente
        setCategories(categoriesData);
        setError(null);
      } catch (error) {
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Atualizar todas as referências de questionnaires para questions
  const filteredCategories = categories.map((category) => {
    const questions = Array.isArray(category.questions) ? category.questions : [];
    const catTitle = (category.name || "").toLowerCase();
    const filteredQuestions = questions.filter(
      (question) =>
        (question.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (question.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        catTitle.includes(searchQuery.toLowerCase())
    );

    return {
      ...category,
      questions: filteredQuestions,
    };
  });

  console.log("Categorias filtradas final:", filteredCategories); // Log 3: Resultado final

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Adicionar atalho de teclado Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="text"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <ElegantBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header com efeito digital */}
        <div className="mt-12 mb-8">
          <DigitalHealthTitle />
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-12">
          <CleanSearchBar
            onSearch={handleSearch}
            placeholder="Pesquisar questionários..."
          />

          {/* Botão de Painel Administrativo */}
          <Link to="/health/painel">
            <button className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105">
              <div className="relative flex items-center gap-2 rounded-lg bg-gray-900/90 px-6 py-3 text-white transition-all duration-300 group-hover:bg-gray-900/70">
                <BarChart3 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium">Painel</span>
              </div>

              {/* Efeito de brilho */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              </div>
            </button>
          </Link>
        </div>

        {/* Mostrar resultado da pesquisa */}
        {searchQuery && (
          <div className="text-center mb-6">
            <p className="text-gray-400">
              {filteredCategories.reduce(
                (total, cat) => total + (cat.questions?.length || 0), // Adicionado optional chaining
                0
              )}{' '}
              resultado(s) encontrado(s) para "{searchQuery}"
            </p>
          </div>
        )}

        {/* Adicionar loading e erro */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            Carregando categorias...
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredCategories
                .filter(
                  (category) =>
                    (category.questions?.length || 0) > 0 || !searchQuery
                )
                .map((category) => {
                  const iconName = typeof category.icon === "string" ? category.icon : "brain";
                  const IconComponent = iconMap[iconName] || Brain;
                  const categoryProgress = getCategoryProgress(
                    category.questions.map(q => String(q.id))
                  );
                  
                  // Then in your JSX:
                  {categoryProgress.completed === categoryProgress.total && categoryProgress.total > 0 && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completo
                    </Badge>
                  )}
                  return (
                    <AccordionItem
                      key={String(category.id)}
                      value={String(category.id)}
                      className="border-0"
                    >
                      <Card
                        className={`${category.color} transition-all duration-200 hover:shadow-lg backdrop-blur-sm`}
                      >
                        <AccordionTrigger className="hover:no-underline p-0">
                          <div className="flex flex-row items-start gap-4 w-full p-2">
                            <div
                              className={`p-3 rounded-full bg-${category.color}-500/20 flex items-center justify-center flex-shrink-0`}
                            >
                              <IconComponent
                                size={24}
                                className={`text-${category.color}-400`}
                              />
                            </div>

                            <div className="flex flex-col flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl text-white font-semibold">
                                  {category.name} {/* Corrigido de 'title' para 'name'*/}
                                </h3>

                                {categoryProgress.completed ===
                                  categoryProgress.total &&
                                  categoryProgress.total > 0 && (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Completo
                                    </Badge>
                                  )}
                              </div>

                              <p className="text-gray-400 text-left">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <CardContent className="pt-0">
                            {(category.questions?.length || 0) === 0 ? (
                              <p className="text-gray-500 text-center py-4">
                                Nenhum questionário encontrado para "{searchQuery}"
                              </p>
                            ) : (
                              <div className="grid gap-3">
                                {category.questions?.map((question) => {
                                  const jaRespondeu = respondidos[String(question.id)];
                                  return (
                                    <div
                                      key={question.id}
                                      className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 hover:border-gray-500/50 transition-colors backdrop-blur-sm"
                                    >
                                      <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-white">
                                              {question.name}
                                            </h3>
                                            {jaRespondeu && (
                                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Concluído
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-400">
                                            {question.description}
                                          </p>
                                        </div>
                                        {jaRespondeu ? (
                                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-base ml-4 px-2 py-2 cursor-default select-none">
                                            <CheckCircle className="w-4 h-4 inline" />
                                          </Badge>
                                        ) : (
                                          <InteractiveHoverButton
                                            onClick={() => navigate(`/health/question/${String(question.id)}`)}
                                            className="ml-4 w-auto px-4 min-w-[100px]"
                                            text={jaRespondeu === undefined ? "Verificando..." : "Iniciar"}
                                            disabled={jaRespondeu === undefined}
                                          />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardContent>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  );
                })}
            </Accordion>

            {/* Mensagem quando nenhuma categoria tem resultados */}
            {searchQuery &&
              filteredCategories.every(
                (category) => (category.questions?.length || 0) === 0 // Adicionado optional chaining
              ) && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">
                    Nenhum questionário encontrado para "{searchQuery}"
                  </p>
                  <p className="text-gray-500 mt-2">
                    Tente pesquisar por outros termos
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
