"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Plus, Trash2, Clock, FileText, Circle, Square, Hash, Star, Type } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ElegantBackground } from "@/components/ui/elegant-background"
import { categoryService, questionnaireService, questionService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

type QuestionType = "radio" | "checkbox" | "number" | "rating" | "text"

interface Question {
  id: string
  pergunta: string
  tipo: QuestionType
  opcoes?: Array<{
    id: string
    texto: string
    valor: number
  }>
  configuracao?: {
    min?: number
    max?: number
    placeholder?: string
    maxStars?: number
  }
}

interface QuestionFromApi {
  id: string | number;
  question_text: string;
  question_type: string;
  options?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  placeholder?: string | null;
}

const questionTypes = [
  {
    value: "radio" as QuestionType,
    label: "Escolha Única",
    icon: Circle,
    description: "Uma opção apenas",
    color: "blue",
  },
  {
    value: "checkbox" as QuestionType,
    label: "Múltipla Escolha",
    icon: Square,
    description: "Várias opções",
    color: "green",
  },
  {
    value: "number" as QuestionType,
    label: "Quantidade",
    icon: Hash,
    description: "Valor numérico",
    color: "orange",
  },
  {
    value: "rating" as QuestionType,
    label: "Avaliação",
    icon: Star,
    description: "Sistema de estrelas",
    color: "yellow",
  },
  {
    value: "text" as QuestionType,
    label: "Texto Livre",
    icon: Type,
    description: "Resposta aberta",
    color: "purple",
  },
]

const typeMap: Record<string, string> = {
  radio: "single_choice",
  checkbox: "multiple_choice",
  number: "numeric",
  rating: "star_rating",
  text: "text_free",
};

function mapBackendTypeToFrontend(type: string): QuestionType {
  switch (type) {
    case "single_choice": return "radio";
    case "multiple_choice": return "checkbox";
    case "numeric": return "number";
    case "star_rating": return "rating";
    case "text_free": return "text";
    default: return "text";
  }
}

const NewQuestion = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    timeLimit: 300, // 5 minutos em segundos
  })

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      pergunta: "",
      tipo: "radio",
      opcoes: [
        { id: "a", texto: "", valor: 0 },
        { id: "b", texto: "", valor: 1 },
      ],
    },
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [categories, setCategories] = useState<{ id: string; title: string }[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  // Adicione um estado para guardar as perguntas originais do banco
  type QuestionApiId = string | number;
  const [originalQuestions, setOriginalQuestions] = useState<QuestionFromApi[]>([]);

  useEffect(() => {
    setLoadingCategories(true)
    categoryService.list().then((data: { id: string; title: string; name?: string }[]) => {
      setCategories(data.map((cat) => ({ id: String(cat.id), title: cat.title || cat.name })))
      setLoadingCategories(false)
    }).catch(() => setLoadingCategories(false))
  }, [])

  useEffect(() => {
    if (id && !loadingCategories) {
      questionnaireService.get(id).then((data) => {
        setFormData({
          title: data.name || "",
          description: data.description || "",
          category: String(data.category_id || ""),
          timeLimit: data.estimated_time_seconds || 300,
        });
      });

      questionService.listByQuestionnaire(Number(id)).then((questionsData) => {
        const questionsArray: QuestionFromApi[] = Array.isArray(questionsData)
          ? questionsData
          : Array.isArray(questionsData.data)
            ? questionsData.data
            : [];
        setOriginalQuestions(questionsArray); // Salva as originais
        const mappedQuestions: Question[] = questionsArray.map((q, idx) => ({
          id: String(q.id),
          pergunta: q.question_text,
          tipo: mapBackendTypeToFrontend(q.question_type),
          opcoes: (() => {
            if (!q.options) return undefined;
            if (typeof q.options === "string") {
              try {
                const parsed = JSON.parse(q.options);
                if (Array.isArray(parsed)) {
                  return (parsed as string[]).map((opt, i) => ({
                    id: String.fromCharCode(97 + i),
                    texto: opt,
                    valor: i,
                  }));
                }
                return undefined;
              } catch {
                return undefined;
              }
            }
            if (Array.isArray(q.options)) {
              return (q.options as string[]).map((opt, i) => ({
                id: String.fromCharCode(97 + i),
                texto: opt,
                valor: i,
              }));
            }
            return undefined;
          })(),
          configuracao: {
            min: q.min_value ?? undefined,
            max: q.max_value ?? undefined,
            placeholder: q.placeholder ?? undefined,
            maxStars: q.question_type === "star_rating" && q.max_value ? q.max_value : undefined,
          },
        }));
        console.log('QUESTIONS PARA O ESTADO:', mappedQuestions);
        setQuestions(mappedQuestions);
      });
    }
  }, [id, loadingCategories]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Atualiza o questionário
      const payload = {
        category_id: Number(formData.category),
        name: formData.title,
        description: formData.description,
        estimated_time_seconds: formData.timeLimit,
        is_active: true,
      }

      let questionnaireId = id;
      if (id) {
        await questionnaireService.update(id, payload);
        questionnaireId = id;
        toast({
          title: "Questionário atualizado com sucesso!",
          description: "As alterações foram salvas.",
        });
      } else {
        const created = await questionnaireService.create(payload);
        console.log('Retorno do create questionnaire:', created);
        questionnaireId = created.id || (created.data && created.data.id);
        toast({
          title: "Questionário criado com sucesso!",
          description: "Você pode adicionar perguntas agora.",
        });
      }

      // Atualizar/criar perguntas
      const originalIds = originalQuestions.map(q => String(q.id));
      const currentIds = questions.map(q => String(q.id)).filter(Boolean);
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const backendType = typeMap[q.tipo] || q.tipo;
        const isChoice = backendType === "single_choice" || backendType === "multiple_choice";
        const isText = backendType === "text_free";
        const isNumeric = backendType === "numeric" || backendType === "star_rating";

        const isStarRating = backendType === "star_rating";
        const payload: any = {
          questionnaire_id: Number(questionnaireId),
          question_text: q.pergunta,
          question_type: backendType,
          order_index: i + 1,
        };

        if (isStarRating) {
          payload.min_value = typeof q.configuracao?.min === 'number' ? q.configuracao.min : 0;
          payload.max_value = typeof q.configuracao?.max === 'number'
            ? q.configuracao.max
            : (typeof q.configuracao?.maxStars === 'number' ? q.configuracao.maxStars : 5);
        }

        if (isChoice && q.opcoes) {
          payload.options = q.opcoes.map((o) => o.texto).filter(Boolean);
        }
        if (isText) {
          payload.placeholder = q.configuracao?.placeholder || null;
        }

        if (isNumeric) {
          payload.min_value = typeof q.configuracao?.min === 'number' ? q.configuracao.min : 0;
          payload.max_value = typeof q.configuracao?.max === 'number' ? q.configuracao.max : 100;
        }

        Object.keys(payload).forEach(key => {
          if (payload[key] === null) delete payload[key];
        });

        if (q.id && originalIds.includes(String(q.id))) {
          console.log('UPDATE question:', q.id, payload);
          await questionService.update(q.id, payload);
        } else {
          console.log('CREATE question:', payload);
          await questionService.create(payload);
        }
      }

      // Deletar perguntas removidas
      for (const originalQ of originalQuestions) {
        if (!currentIds.includes(String(originalQ.id))) {
          await questionService.delete(originalQ.id);
        }
      }

      navigate("/health/manager");
    } catch (err) {
      toast({
        title: id ? "Erro ao atualizar questionário" : "Erro ao criar questionário",
        description: (err as Error)?.message || "Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: (questions.length + 1).toString(),
      pergunta: "",
      tipo: "radio",
      opcoes: [
        { id: "a", texto: "", valor: 0 },
        { id: "b", texto: "", valor: 1 },
      ],
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const updateQuestion = (questionId: string, pergunta: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, pergunta } : q)))
  }

  const updateQuestionType = (questionId: string, tipo: QuestionType) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const updatedQuestion: Question = { ...q, tipo }

          // Configurar opções baseado no tipo
          if (tipo === "radio" || tipo === "checkbox") {
            updatedQuestion.opcoes = q.opcoes || [
              { id: "a", texto: "", valor: 0 },
              { id: "b", texto: "", valor: 1 },
            ]
          } else {
            delete updatedQuestion.opcoes
          }

          // Configurações específicas por tipo
          if (tipo === "number") {
            updatedQuestion.configuracao = { min: 0, max: 100 }
          } else if (tipo === "rating") {
            updatedQuestion.configuracao = { maxStars: 5 }
          } else if (tipo === "text") {
            updatedQuestion.configuracao = { placeholder: "Digite sua resposta..." }
          }

          return updatedQuestion
        }
        return q
      }),
    )
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.opcoes) {
          const nextLetter = String.fromCharCode(97 + q.opcoes.length)
          return {
            ...q,
            opcoes: [
              ...q.opcoes,
              {
                id: nextLetter,
                texto: "",
                valor: q.opcoes.length,
              },
            ],
          }
        }
        return q
      }),
    )
  }

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.opcoes) {
          return {
            ...q,
            opcoes: q.opcoes.filter((opt) => opt.id !== optionId),
          }
        }
        return q
      }),
    )
  }

  const updateOption = (questionId: string, optionId: string, texto: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.opcoes) {
          return {
            ...q,
            opcoes: q.opcoes.map((opt) => (opt.id === optionId ? { ...opt, texto } : opt)),
          }
        }
        return q
      }),
    )
  }

  const updateQuestionConfig = (questionId: string, config: Partial<Question["configuracao"]>) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            configuracao: { ...q.configuracao, ...config },
          }
        }
        return q
      }),
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeLabel = (seconds: number) => {
    if (seconds < 120) return "Rápido"
    if (seconds < 600) return "Médio"
    if (seconds < 1200) return "Longo"
    return "Muito Longo"
  }

  const renderQuestionPreview = (question: Question) => {
    const questionType = questionTypes.find((t) => t.value === question.tipo)

    switch (question.tipo) {
      case "radio":
        return (
          <div className="space-y-2">
            {question.opcoes?.map((opcao) => (
              <div key={opcao.id} className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 rounded-full"></div>
                <span className="text-gray-300">{opcao.texto || `Opção ${opcao.id.toUpperCase()}`}</span>
              </div>
            ))}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.opcoes?.map((opcao) => (
              <div key={opcao.id} className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-400 rounded"></div>
                <span className="text-gray-300">{opcao.texto || `Opção ${opcao.id.toUpperCase()}`}</span>
              </div>
            ))}
          </div>
        )

      case "number":
        return (
          <div className="flex items-center gap-4">
            <input
              type="number"
              placeholder={`${question.configuracao?.min || 0} - ${question.configuracao?.max || 100}`}
              className="px-3 py-2 bg-gray-600/50 border border-orange-400/50 rounded text-white"
              disabled
            />
            <span className="text-gray-400 text-sm">
              Min: {question.configuracao?.min || 0} | Max: {question.configuracao?.max || 100}
            </span>
          </div>
        )

      case "rating":
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: question.configuracao?.maxStars || 5 }).map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
            ))}
            <span className="text-gray-400 text-sm ml-2">({question.configuracao?.maxStars || 5} estrelas)</span>
          </div>
        )

      case "text":
        return (
          <textarea
            placeholder={question.configuracao?.placeholder || "Digite sua resposta..."}
            className="w-full px-3 py-2 bg-gray-600/50 border border-purple-400/50 rounded text-white resize-none"
            rows={3}
            disabled
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <ElegantBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/health/painel">
            <EnhancedButton variant="secondary" size="sm" icon="chevron">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </EnhancedButton>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Novo Questionário</h1>
            <p className="text-gray-400">Crie um novo questionário de avaliação</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          {/* Informações básicas */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white font-medium">
                    Título do Questionário *
                  </Label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ex: Questionário de Ansiedade"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white font-medium">
                    Categoria *
                  </Label>
                  {loadingCategories ? (
                    <div className="text-gray-400">Carregando categorias...</div>
                  ) : (
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-all"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-medium">
                  Descrição
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva o objetivo deste questionário..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                />
              </div>

              {/* Controle de tempo melhorado */}
              <div className="space-y-4">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tempo Limite
                </Label>

                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-white">{formatTime(formData.timeLimit)}</div>
                      <div className="flex flex-col">
                        <Badge
                          className={`text-xs mb-1 ${
                            formData.timeLimit < 120
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : formData.timeLimit < 600
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : formData.timeLimit < 1200
                                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {getTimeLabel(formData.timeLimit)}
                        </Badge>
                        <span className="text-xs text-gray-400">{Math.floor(formData.timeLimit / 60)} minutos</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {[60, 300, 600, 900, 1200, 1800].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleInputChange("timeLimit", time)}
                          className={`px-3 py-1 rounded text-xs transition-all ${
                            formData.timeLimit === time
                              ? "bg-blue-500 text-white"
                              : "bg-gray-600/50 text-gray-300 hover:bg-gray-600/70"
                          }`}
                        >
                          {formatTime(time)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="range"
                    min="60"
                    max="1800"
                    step="60"
                    value={formData.timeLimit}
                    onChange={(e) => handleInputChange("timeLimit", Number.parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />

                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>1 min</span>
                    <span>15 min</span>
                    <span>30 min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Perguntas */}
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">Perguntas</CardTitle>
                <EnhancedButton type="button" onClick={addQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pergunta
                </EnhancedButton>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question, questionIndex) => {
                const questionType = questionTypes.find((t) => t.value === question.tipo)
                const IconComponent = questionType?.icon || Circle

                return (
                  <div key={question.id} className="p-6 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${questionType?.color}-500/20`}>
                          <IconComponent className={`w-4 h-4 text-${questionType?.color}-400`} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Pergunta {questionIndex + 1}</h4>
                          <p className="text-sm text-gray-400">{questionType?.description}</p>
                        </div>
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Tipo de pergunta */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium">Tipo de Pergunta</Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {questionTypes.map((type) => {
                            const TypeIcon = type.icon
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => updateQuestionType(question.id, type.value)}
                                className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                                  question.tipo === type.value
                                    ? `border-${type.color}-500 bg-${type.color}-500/20`
                                    : "border-gray-600/50 bg-gray-700/30 hover:border-gray-500/70"
                                }`}
                              >
                                <TypeIcon
                                  className={`w-5 h-5 mx-auto mb-2 ${
                                    question.tipo === type.value ? `text-${type.color}-400` : "text-gray-400"
                                  }`}
                                />
                                <div className="text-xs text-center">
                                  <div
                                    className={`font-medium ${
                                      question.tipo === type.value ? `text-${type.color}-300` : "text-gray-300"
                                    }`}
                                  >
                                    {type.label}
                                  </div>
                                  <div className="text-gray-500 text-[10px] mt-1">{type.description}</div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Texto da pergunta */}
                      <div className="space-y-2">
                        <Label className="text-white font-medium">Pergunta</Label>
                        <textarea
                          value={question.pergunta}
                          onChange={(e) => updateQuestion(question.id, e.target.value)}
                          placeholder="Digite sua pergunta aqui..."
                          rows={2}
                          className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                        />
                      </div>

                      {/* Configurações específicas por tipo */}
                      {(question.tipo === "radio" || question.tipo === "checkbox") && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-white font-medium">Opções de Resposta</Label>
                            <button
                              type="button"
                              onClick={() => addOption(question.id)}
                              className="text-blue-400 hover:text-blue-300 text-sm transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Adicionar opção
                            </button>
                          </div>

                          {question.opcoes?.map((opcao, optionIndex) => (
                            <div key={opcao.id} className="flex items-center gap-3">
                              <span className="text-gray-400 font-mono text-sm w-6">{opcao.id})</span>
                              <input
                                type="text"
                                value={opcao.texto}
                                onChange={(e) => updateOption(question.id, opcao.id, e.target.value)}
                                placeholder={`Opção ${opcao.id.toUpperCase()}`}
                                className="flex-1 px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                              />
                              <Badge className="bg-gray-600/50 text-gray-300 text-xs min-w-[40px] text-center">
                                {opcao.valor}
                              </Badge>
                              {question.opcoes && question.opcoes.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(question.id, opcao.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.tipo === "number" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white font-medium">Valor Mínimo</Label>
                            <input
                              type="number"
                              value={question.configuracao?.min || 0}
                              onChange={(e) =>
                                updateQuestionConfig(question.id, {
                                  min: Number.parseInt(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded text-white focus:outline-none focus:border-orange-500/50 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white font-medium">Valor Máximo</Label>
                            <input
                              type="number"
                              value={question.configuracao?.max || 100}
                              onChange={(e) =>
                                updateQuestionConfig(question.id, {
                                  max: Number.parseInt(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded text-white focus:outline-none focus:border-orange-500/50 transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {question.tipo === "rating" && (
                        <div className="space-y-2">
                          <Label className="text-white font-medium">Número de Estrelas</Label>
                          <select
                            value={question.configuracao?.maxStars || 5}
                            onChange={(e) =>
                              updateQuestionConfig(question.id, {
                                maxStars: Number.parseInt(e.target.value),
                                max: Number.parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                          >
                            {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                {num} estrelas
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {question.tipo === "text" && (
                        <div className="space-y-2">
                          <Label className="text-white font-medium">Placeholder</Label>
                          <input
                            type="text"
                            value={question.configuracao?.placeholder || ""}
                            onChange={(e) => updateQuestionConfig(question.id, { placeholder: e.target.value })}
                            placeholder="Digite sua resposta..."
                            className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all"
                          />
                        </div>
                      )}

                      {/* Preview */}
                      <div className="space-y-3">
                        <Label className="text-white font-medium">Preview</Label>
                        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600/30">
                          <h5 className="text-white font-medium mb-3">
                            {question.pergunta || "Sua pergunta aparecerá aqui"}
                          </h5>
                          {renderQuestionPreview(question)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex gap-4">
            <Link to="/health/painel" className="flex-1">
              <EnhancedButton variant="secondary" className="w-full">
                Cancelar
              </EnhancedButton>
            </Link>
            <EnhancedButton type="submit" loading={isSubmitting} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar Questionário
            </EnhancedButton>
          </div>
        </form>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  )
}

export default NewQuestion
