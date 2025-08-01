"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { X, Bot, Send, User, Sparkles, CheckCircle2, Wand2, Trash2, Plus, GripVertical } from "lucide-react"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Label } from "@/components/ui/label";
import { Clock, FileText, Circle, Square, Hash, Star, Type } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { iaAnalysisService, categoryService, questionnaireService, questionService } from "@/lib/api";

interface Opcao {
  texto: string;
  valor: number;
}

interface Pergunta {
  pergunta: string;
  tipo: string;
  opcoes?: Opcao[];
  min_value?: number;
  max_value?: number;
  placeholder?: string;
}

interface Questionario {
  title: string;
  description: string;
  category: string;
  timeLimit: number;
  questions: Pergunta[];
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  questionario?: Questionario;
}

interface IAQuestion {
  question_text: string;
  question_type: string;
  options?: string[];
  min_value?: number;
  max_value?: number;
}

interface AIQuickCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionarioCreated?: (questionario: Questionario) => void;
}

// Sortable Item para perguntas
function SortableQuestion({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-start gap-2 group">
      <button {...listeners} className="mt-1 p-1 text-gray-400 hover:text-purple-400 cursor-grab focus:outline-none">
        <GripVertical className="w-5 h-5" />
      </button>
      {children}
    </div>
  );
}

// Sortable Item para opções
function SortableOption({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group">
      <button {...listeners} className="p-1 text-gray-400 hover:text-purple-400 cursor-grab focus:outline-none">
        <GripVertical className="w-4 h-4" />
      </button>
      {children}
    </div>
  );
}

const questionTypes = [
  {
    value: "radio",
    label: "Escolha Única",
    icon: Circle,
    description: "Uma opção apenas",
    color: "blue",
  },
  {
    value: "checkbox",
    label: "Múltipla Escolha",
    icon: Square,
    description: "Várias opções",
    color: "green",
  },
  {
    value: "number",
    label: "Quantidade",
    icon: Hash,
    description: "Valor numérico",
    color: "orange",
  },
  {
    value: "rating",
    label: "Avaliação",
    icon: Star,
    description: "Sistema de estrelas",
    color: "yellow",
  },
  {
    value: "text",
    label: "Texto Livre",
    icon: Type,
    description: "Resposta aberta",
    color: "purple",
  },
];

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
function getTimeLabel(seconds: number) {
  if (seconds < 120) return "Rápido";
  if (seconds < 600) return "Médio";
  if (seconds < 1200) return "Longo";
  return "Muito Longo";
}

const typeMap: Record<string, string> = {
  radio: "single_choice",
  checkbox: "multiple_choice",
  number: "numeric",
  rating: "star_rating",
  text: "text_free",
};

const AIQuickCreator = ({ isOpen, onClose, onQuestionarioCreated }: AIQuickCreatorProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentStep, setCurrentStep] = useState<"chat" | "preview" | "created">("chat")
  const [generatedQuestionario, setGeneratedQuestionario] = useState<Questionario | null>(null)
  const [editingQuestionario, setEditingQuestionario] = useState<Questionario | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [categories, setCategories] = useState<{ id: string; title: string }[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensagem inicial da IA
      const welcomeMessage: Message = {
        id: "welcome",
        type: "ai",
        content: `🚀 **Criação Rápida de Questionários**

Descreva o questionário que você quer criar e eu gero para você!

**Exemplos:**
• "Questionário sobre ansiedade com 5 perguntas"
• "Avaliação nutricional para adolescentes"
• "Questionário de qualidade do sono"

**O que você quer criar?**`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    if (currentStep === "preview" && generatedQuestionario) {
      setEditingQuestionario({ ...generatedQuestionario })
    }
  }, [currentStep, generatedQuestionario])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setLoadingCategories(true);
    categoryService.list()
      .then((data) => {
        console.log('Categorias carregadas:', data); // ADICIONAR ESTE LOG
        setCategories(data.map((cat: { id: string | number; title?: string; name?: string }) => ({
          id: String(cat.id),
          title: cat.title || cat.name,
        })));
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Chama a IA SEM categoria - só o prompt
      console.log('Enviando para IA:', { prompt: inputMessage });
      const questionario = await iaAnalysisService.generate(inputMessage); // SEM category_id
      
      // Verificar se a resposta contém questionario_gerado
      const questionarioData = questionario.questionario_gerado || questionario;
      
      // Mapeia as perguntas para o formato do frontend
      const mappedQuestions = (questionarioData.questions || []).map((q: IAQuestion) => {
        let tipo = "";
        switch (q.question_type) {
          case "single_choice":
            tipo = "radio";
            break;
          case "multiple_choice":
            tipo = "checkbox";
            break;
          case "star_rating":
            tipo = "rating";
            break;
          case "numeric":
            tipo = "number";
            break;
          case "text_free":
            tipo = "text";
            break;
          default:
            tipo = "text";
        }
        let opcoes = undefined;
        if (Array.isArray(q.options)) {
          opcoes = q.options.map((opt, idx) => ({ texto: opt, valor: idx }));
        }
        return {
          pergunta: q.question_text,
          tipo,
          opcoes,
          min_value: q.min_value,
          max_value: q.max_value,
        };
      });
      
      // Adapta o formato se necessário
      const aiResponse: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: `✅ **Questionário gerado!**\n\n${questionarioData.name || questionarioData.title}\n${questionarioData.description}`,
        timestamp: new Date(),
        questionario: {
          title: questionarioData.name || questionarioData.title || "",
          description: questionarioData.description || "",
          category: categories.length > 0 ? categories[0].id : "", // Use primeira categoria como padrão
          timeLimit: questionarioData.timeLimit || 300,
          questions: mappedQuestions,
        },
      };
      setMessages((prev) => [...prev, aiResponse]);
      setGeneratedQuestionario(aiResponse.questionario!);
      setCurrentStep("preview");
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: "❌ Erro ao gerar questionário. Tente novamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  const handleCreateQuestionario = async () => {
    if (editingQuestionario) {
      if (!editingQuestionario.category) {
        alert('Por favor, selecione uma categoria antes de criar o questionário.');
        return;
      }
      
      try {
        // 1. Cria o questionário
        const created = await questionnaireService.create({
          category_id: editingQuestionario.category,
          name: editingQuestionario.title,
          description: editingQuestionario.description,
          estimated_time_seconds: editingQuestionario.timeLimit,
          is_active: true,
        });
        
        const questionnaireId = created.data?.id || created.id;
        
        // 2. Cria as questões com as opções corretamente formatadas
        for (let i = 0; i < editingQuestionario.questions.length; i++) {
          const q = editingQuestionario.questions[i];
          const type = typeMap[q.tipo] || q.tipo;
          
          const payload: any = {
            questionnaire_id: questionnaireId,
            question_text: q.pergunta,
            question_type: type,
            order_index: i + 1,
            weight: 1.0,
          };
          
          // Adiciona opções se for do tipo escolha
          if ((type === 'single_choice' || type === 'multiple_choice') && q.opcoes) {
            payload.options = q.opcoes.map(opt => opt.texto); // Mapeia corretamente as opções
          }
          
          // Adiciona outros campos específicos
          if (type === 'numeric' || type === 'star_rating') {
            if (q.min_value !== undefined) payload.min_value = q.min_value;
            if (q.max_value !== undefined) payload.max_value = q.max_value;
          }
          
          if (type === 'text_free' && q.placeholder) {
            payload.placeholder = q.placeholder;
          }
          
          await questionService.create(payload);
        }
        
        setCurrentStep('created');
        if (onQuestionarioCreated) onQuestionarioCreated(editingQuestionario);
      } catch (error) {
        console.error('Erro ao criar questionário:', error);
        alert('Erro ao criar questionário!');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const updateQuestionarioField = (field: keyof Questionario, value: string | number) => {
    setEditingQuestionario((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  const updateQuestion = (index: number, field: keyof Pergunta, value: string | number | Opcao[]) => {
    setEditingQuestionario((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
          }
        : prev
    );
  }

  const addQuestion = () => {
    const newQuestion: Pergunta = {
      pergunta: "Nova pergunta",
      tipo: "radio",
      opcoes: [
        { texto: "Opção 1", valor: 0 },
        { texto: "Opção 2", valor: 1 },
      ],
    };
    setEditingQuestionario((prev) =>
      prev ? { ...prev, questions: [...prev.questions, newQuestion] } : prev
    );
  }

  const removeQuestion = (index: number) => {
    setEditingQuestionario((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index),
          }
        : prev
    );
  }

  const addOption = (questionIndex: number) => {
    setEditingQuestionario((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q, i) =>
              i === questionIndex
                ? {
                    ...q,
                    opcoes: [
                      ...(q.opcoes || []),
                      { texto: `Opção ${(q.opcoes?.length || 0) + 1}`, valor: q.opcoes?.length || 0 },
                    ],
                  }
                : q
            ),
          }
        : prev
    );
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setEditingQuestionario((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q, i) =>
              i === questionIndex
                ? {
                    ...q,
                    opcoes: q.opcoes?.filter((_, oi) => oi !== optionIndex),
                  }
                : q
            ),
          }
        : prev
    );
  }

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof Opcao, value: string | number) => {
    setEditingQuestionario((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q, i) =>
              i === questionIndex
                ? {
                    ...q,
                    opcoes: q.opcoes?.map((opt, oi) => (oi === optionIndex ? { ...opt, [field]: value } : opt)),
                  }
                : q
            ),
          }
        : prev
    );
  }

  const quickPrompts = [
    "Questionário sobre ansiedade com 5 perguntas",
    "Avaliação de alimentação saudável",
    "Questionário de qualidade do sono",
    "Avaliação de autoestima pessoal",
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header - Mais compacto */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Wand2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Criação Rápida com IA</h2>
              <p className="text-gray-400 text-xs">Gere questionários personalizados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {currentStep === "chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Area - Otimizado */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-2 ${message.type === "user" ? "justify-end" : ""}`}>
                  {message.type === "ai" && (
                    <div className="w-7 h-7 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-purple-400" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800/50 text-gray-100 border border-gray-700/30"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    <div className="text-xs text-gray-500 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                  </div>

                  {message.type === "user" && (
                    <div className="w-7 h-7 bg-gray-600/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts - Mais compacto */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-gray-400 text-xs mb-2">💡 Sugestões:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(prompt)}
                      className="px-2 py-1 bg-gray-800/50 hover:bg-gray-700/50 rounded text-xs text-gray-300 hover:text-white transition-colors border border-gray-700/30"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input - Mais compacto */}
            <div className="border-t border-gray-700/50 p-4 space-y-2">
              <div className="flex gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Descreva o questionário que você quer criar..."
                  className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 resize-none p-2 text-sm"
                  rows={1}
                />
                <EnhancedButton onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping} size="sm">
                  <Send className="w-4 h-4" />
                </EnhancedButton>
              </div>
            </div>
          </div>
        )}

        {currentStep === "preview" && editingQuestionario && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;
              // Perguntas
              const oldIndex = editingQuestionario.questions.findIndex((q, i) => `q-${i}` === active.id);
              const newIndex = editingQuestionario.questions.findIndex((q, i) => `q-${i}` === over.id);
              if (oldIndex !== -1 && newIndex !== -1) {
                const newQuestions = arrayMove(editingQuestionario.questions, oldIndex, newIndex);
                setEditingQuestionario({ ...editingQuestionario, questions: newQuestions });
              }
            }}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Header editável */}
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 mb-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-white text-sm font-medium mb-1 block">Título</label>
                    <input
                      type="text"
                      value={editingQuestionario.title}
                      onChange={(e) => updateQuestionarioField("title", e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg text-white p-2 text-sm focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-1 block">Descrição</label>
                    <textarea
                      value={editingQuestionario.description}
                      onChange={(e) => updateQuestionarioField("description", e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg text-white p-2 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-white text-sm font-medium mb-1 block">Categoria</label>
                      <Select value={String(editingQuestionario.category)} onValueChange={(v) => updateQuestionarioField("category", v)}>
                        <SelectTrigger className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg text-white p-2 text-sm focus:outline-none focus:border-purple-500/50">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-white text-sm font-medium mb-1 block">Tempo</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm font-bold">{formatTime(editingQuestionario.timeLimit)}</span>
                          <span className={`text-xs ${editingQuestionario.timeLimit < 120 ? "text-green-400" : editingQuestionario.timeLimit < 600 ? "text-blue-400" : editingQuestionario.timeLimit < 1200 ? "text-orange-400" : "text-red-400"}`}>{getTimeLabel(editingQuestionario.timeLimit)}</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="1800"
                          step="60"
                          value={editingQuestionario.timeLimit}
                          onChange={(e) => updateQuestionarioField("timeLimit", Number.parseInt(e.target.value))}
                          className="w-full h-1 bg-purple-500/30 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          style={{ accentColor: '#a78bfa' }}
                        />
                        <div className="flex gap-1 justify-between text-xs text-gray-400">
                          {[60, 300, 600, 900, 1200, 1800].map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => updateQuestionarioField("timeLimit", time)}
                              className={`px-2 py-0.5 rounded text-xs transition-all ${editingQuestionario.timeLimit === time ? "bg-purple-500 text-white" : "bg-gray-600/50 text-gray-300 hover:bg-gray-600/70"}`}
                            >
                              {formatTime(time)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        IA
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Perguntas editáveis - estilo melhorado */}
              <SortableContext
                items={editingQuestionario.questions.map((_, i) => `q-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-white">
                      Perguntas ({editingQuestionario.questions.length})
                    </h4>
                    <button
                      onClick={addQuestion}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
                    >
                      <Plus className="w-3 h-3" />
                      Adicionar Pergunta
                    </button>
                  </div>
                  {editingQuestionario.questions.map((question, index) => {
                    const questionType = questionTypes.find((t) => t.value === question.tipo);
                    const IconComponent = questionType?.icon || Circle;
                    return (
                      <SortableQuestion key={`q-${index}`} id={`q-${index}`}>
                        <div className="w-full p-6 bg-gray-700/30 rounded-lg border border-gray-600/30 space-y-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-${questionType?.color}-500/20`}>
                                <IconComponent className={`w-4 h-4 text-${questionType?.color}-400`} />
                              </div>
                              <div>
                                <h4 className="text-white font-medium">Pergunta {index + 1}</h4>
                                <p className="text-sm text-gray-400">{questionType?.description}</p>
                              </div>
                            </div>
                            {editingQuestionario.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeQuestion(index)}
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
                              <Select value={question.tipo} onValueChange={(v) => updateQuestion(index, "tipo", v)}>
                                <SelectTrigger className="w-full md:w-56 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white p-2 text-sm focus:outline-none focus:border-purple-500/50 flex items-center gap-2">
                                  {(() => {
                                    const selected = questionTypes.find((t) => t.value === question.tipo);
                                    if (!selected) return <SelectValue placeholder="Tipo de pergunta" />;
                                    const Icon = selected.icon;
                                    return (
                                      <>
                                        <Icon className={`w-4 h-4 text-${selected.color}-400`} />
                                        <span>{selected.label}</span>
                                      </>
                                    );
                                  })()}
                                </SelectTrigger>
                                <SelectContent>
                                  {questionTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value} className="flex items-center gap-2">
                                      <type.icon className={`w-4 h-4 text-${type.color}-400`} />
                                      <span>{type.label}</span>
                                      <span className="text-gray-400 text-xs ml-2">{type.description}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Texto da pergunta */}
                            <div className="space-y-2">
                              <Label className="text-white font-medium">Pergunta</Label>
                              <textarea
                                value={question.pergunta}
                                onChange={(e) => updateQuestion(index, "pergunta", e.target.value)}
                                placeholder="Digite sua pergunta aqui..."
                                rows={2}
                                className="w-full bg-gray-700/50 border border-gray-600/50 rounded text-white p-2 text-sm focus:outline-none focus:border-purple-500/50"
                              />
                            </div>
                            {/* Opções editáveis com drag-and-drop */}
                            {(question.tipo === "radio" || question.tipo === "checkbox") && (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={({ active, over }) => {
                                  if (!over || active.id === over.id) return;
                                  const oldIndex = question.opcoes?.findIndex((_, i) => `o-${index}-${i}` === active.id) ?? -1;
                                  const newIndex = question.opcoes?.findIndex((_, i) => `o-${index}-${i}` === over.id) ?? -1;
                                  if (oldIndex !== -1 && newIndex !== -1 && question.opcoes) {
                                    const newOpcoes = arrayMove(question.opcoes, oldIndex, newIndex);
                                    updateQuestion(index, "opcoes", newOpcoes);
                                  }
                                }}
                              >
                                <SortableContext
                                  items={question.opcoes?.map((_, i) => `o-${index}-${i}`) || []}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="ml-8 space-y-2">
                                    {question.opcoes?.map((opcao, optIndex) => (
                                      <SortableOption key={`o-${index}-${optIndex}`} id={`o-${index}-${optIndex}`}>
                                        <input
                                          type="text"
                                          value={opcao.texto}
                                          onChange={(e) => updateOption(index, optIndex, "texto", e.target.value)}
                                          className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded text-white p-1 text-xs focus:outline-none focus:border-purple-500/50"
                                        />
                                        {question.opcoes && question.opcoes.length > 2 && (
                                          <button
                                            onClick={() => removeOption(index, optIndex)}
                                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                          >
                                            <Trash2 className="w-2 h-2" />
                                          </button>
                                        )}
                                      </SortableOption>
                                    ))}
                                    <button
                                      onClick={() => addOption(index)}
                                      className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-gray-400 rounded text-xs hover:text-white transition-colors"
                                    >
                                      <Plus className="w-2 h-2" />
                                      Adicionar opção
                                    </button>
                                  </div>
                                </SortableContext>
                              </DndContext>
                            )}
                            {/* Inputs específicos por tipo */}
                            {question.tipo === "rating" && (
                              <div className="space-y-2">
                                <Label className="text-white font-medium">Número de Estrelas</Label>
                                <select
                                  value={question.max_value || 5}
                                  onChange={e => updateQuestion(index, "max_value", Number(e.target.value))}
                                  className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                                >
                                  {[3,4,5,6,7,8,9,10].map(num => (
                                    <option key={num} value={num}>{num} estrelas</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            {question.tipo === "number" && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-white font-medium">Valor Mínimo</Label>
                                  <input
                                    type="number"
                                    value={question.min_value ?? 0}
                                    onChange={e => updateQuestion(index, "min_value", Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded text-white focus:outline-none focus:border-orange-500/50 transition-all"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-white font-medium">Valor Máximo</Label>
                                  <input
                                    type="number"
                                    value={question.max_value ?? 100}
                                    onChange={e => updateQuestion(index, "max_value", Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded text-white focus:outline-none focus:border-orange-500/50 transition-all"
                                  />
                                </div>
                              </div>
                            )}
                            {/* Preview visual da pergunta */}
                            <div className="space-y-3">
                              <Label className="text-white font-medium">Preview</Label>
                              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600/30">
                                <h5 className="text-white font-medium mb-3">
                                  {question.pergunta || "Sua pergunta aparecerá aqui"}
                                </h5>
                                {/* Renderização visual baseada no tipo */}
                                {question.tipo === "radio" && (
                                  <div className="space-y-2">
                                    {question.opcoes?.map((opcao, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-blue-400 rounded-full"></div>
                                        <span className="text-gray-300">{opcao.texto || `Opção ${i + 1}`}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {question.tipo === "checkbox" && (
                                  <div className="space-y-2">
                                    {question.opcoes?.map((opcao, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-green-400 rounded"></div>
                                        <span className="text-gray-300">{opcao.texto || `Opção ${i + 1}`}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {question.tipo === "number" && (
                                  <div className="flex items-center gap-4">
                                    <input
                                      type="number"
                                      placeholder="0 - 100"
                                      className="px-3 py-2 bg-gray-600/50 border border-orange-400/50 rounded text-white"
                                      disabled
                                    />
                                    <span className="text-gray-400 text-sm">Min: 0 | Max: 100</span>
                                  </div>
                                )}
                                {question.tipo === "rating" && (
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                                    ))}
                                    <span className="text-gray-400 text-sm ml-2">(5 estrelas)</span>
                                  </div>
                                )}
                                {question.tipo === "text" && (
                                  <textarea
                                    placeholder="Digite sua resposta..."
                                    className="w-full px-3 py-2 bg-gray-600/50 border border-purple-400/50 rounded text-white resize-none"
                                    rows={3}
                                    disabled
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </SortableQuestion>
                    );
                  })}
                </div>
              </SortableContext>

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t border-gray-700/30">
                <button
                  onClick={() => setCurrentStep("chat")}
                  className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-white transition-colors text-sm"
                >
                  Voltar ao Chat
                </button>
                <EnhancedButton onClick={handleCreateQuestionario} className="flex-1" size="sm">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Criar Questionário
                </EnhancedButton>
              </div>
            </div>
          </DndContext>
        )}

        {currentStep === "created" && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Questionário Criado!</h3>
                <p className="text-gray-400">Seu questionário foi gerado e está pronto para uso.</p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-white transition-colors text-sm"
                >
                  Fechar
                </button>
                <EnhancedButton
                  onClick={() => {
                    setCurrentStep("chat")
                    setMessages([])
                    setGeneratedQuestionario(null)
                    setEditingQuestionario(null)
                  }}
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Criar Outro
                </EnhancedButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIQuickCreator
