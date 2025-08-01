"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Clock, ArrowLeft, CheckCircle } from "lucide-react";
import { ElegantBackground } from "@/components/ui/elegant-background";
import { StarBorder } from "@/components/ui/star-border";
import { useNavigate, useParams } from "react-router-dom";
import { questionnaireService, responseService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Definir tipos adequados para questionário e perguntas
interface Pergunta {
  id: number;
  pergunta: string;
  tipo: string; // single_choice, multiple_choice, text_free, star_rating, numeric
  opcoes: { id: string; texto: string; valor: number }[];
  max_stars?: number; // Adicionado para star_rating
}

interface Questionario {
  id: number;
  name: string;
  description: string;
  perguntas: Pergunta[];
  timeLimit?: number;
}

// Definir tipo para pergunta vinda da API
interface ApiQuestion {
  id: number;
  question_text: string;
  question_type: string;
  options?: string | string[] | null;
  max_stars?: number;
}

type AnswerValue = number | number[] | string;

function hasDataValues(obj: unknown): obj is { dataValues: { id: number } } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "dataValues" in obj &&
    typeof (obj as { dataValues?: { id?: unknown } }).dataValues?.id ===
      "number"
  );
}

export default function QuestionarioPage() {
  const params = useParams<{ id: string }>();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionario, setQuestionario] = useState<Questionario | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = useCallback(async () => {
    if (!user?.id) {
      alert("Você precisa estar logado para enviar o questionário.");
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        employee_id: user?.id,
        questionnaire_id: questionario.id.toString(), // Convert to string
        responses: Object.entries(answers).map(([question_id, answer]) => ({
          question_id: question_id, // Keep as string (no Number conversion)
          answer: Array.isArray(answer)
            ? answer.map(String)
            : typeof answer === "number"
            ? String(answer)
            : answer,
        })),
      };
      const result = await responseService.submit(payload);
      console.log("Resposta do backend:", result);
    } catch (err) {
      console.error("Erro ao enviar respostas:", err);
    }
    setCompleted(true);
    setIsSubmitting(false);
  }, [user?.id, questionario, answers]);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (started && timeLeft === 0) {
      handleSubmit();
    }
  }, [started, timeLeft, handleSubmit]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    questionnaireService
      .get(params.id)
      .then((data) => {
        setQuestionario({
          id: data.id,
          name: data.name,
          description: data.description,
          perguntas:
            data.questions?.map((q: ApiQuestion) => ({
              id: q.id,
              pergunta: q.question_text,
              tipo: q.question_type,
              opcoes: (() => {
                if (!q.options) return [];
                if (typeof q.options === "string") {
                  try {
                    const parsed = JSON.parse(q.options);
                    if (Array.isArray(parsed)) {
                      return parsed.map((opt: string, idx: number) => ({
                        id: String(idx),
                        texto: opt,
                        valor: idx,
                      }));
                    }
                    return [];
                  } catch {
                    return [];
                  }
                }
                if (Array.isArray(q.options)) {
                  return q.options.map((opt: string, idx: number) => ({
                    id: String(idx),
                    texto: opt,
                    valor: idx,
                  }));
                }
                return [];
              })(),
              max_stars:
                q.question_type === "star_rating" && q.max_stars
                  ? q.max_stars
                  : undefined,
            })) || [],
          timeLimit: data.estimated_time_seconds || 300,
        });
      })
      .catch(() => setQuestionario(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const startQuestionario = () => {
    setStarted(true);
    setTimeLeft(questionario?.timeLimit || 0);
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value as AnswerValue }));
  };

  const nextQuestion = async () => {
    if (currentQuestion < questionario?.perguntas.length - 1 || 0) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await handleSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!questionario) {
    return (
      <div className="min-h-screen bg-gray-900 relative flex items-center justify-center">
        <ElegantBackground />
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2 text-white">
              Questionário não encontrado
            </h2>
            <EnhancedButton onClick={() => navigate("/health")}>
              Voltar ao início
            </EnhancedButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-900 relative flex items-center justify-center">
        <ElegantBackground />
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-white">
              Questionário Concluído!
            </h2>
            <p className="text-gray-400 mb-4">
              Suas respostas foram enviadas com sucesso. Obrigado por
              participar!
            </p>
            <EnhancedButton
              onClick={() => navigate("/health")}
              variant="success"
            >
              Voltar ao início
            </EnhancedButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  const perguntaAtual = questionario.perguntas[currentQuestion];

  const checkedValues =
    perguntaAtual.tipo === "multiple_choice" &&
    Array.isArray(answers[perguntaAtual.id])
      ? answers[perguntaAtual.id]
      : [];

  return (
    <div className="min-h-screen bg-gray-900 relative pt-20">
      <ElegantBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center mb-6">
          <EnhancedButton
            onClick={() => navigate("/health")}
            variant="secondary"
            size="sm"
            icon="chevron"
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </EnhancedButton>
          {started && (
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          {!started ? (
            /* Tela inicial */
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">
                  {questionario.name}
                </CardTitle>
                <CardDescription className="text-base mt-4 text-gray-300">
                  {questionario.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Tempo limite: {Math.floor(questionario.timeLimit / 60)}{" "}
                    minutos
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Total de perguntas: {questionario.perguntas.length}
                  </p>
                </div>
                <div className="flex justify-center">
                  <StarBorder
                    onClick={startQuestionario}
                    className="text-lg font-semibold min-w-[200px]"
                    color="#3b82f6"
                    speed="4s"
                    size="lg"
                  >
                    Iniciar Avaliação
                  </StarBorder>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Tela de perguntas */
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-400">
                    Pergunta {currentQuestion + 1} de{" "}
                    {questionario.perguntas.length}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      timeLeft < 60 ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Progress
                  value={
                    ((currentQuestion + 1) / questionario.perguntas.length) *
                    100
                  }
                  className="mb-4 bg-gray-700/50"
                />
                <CardTitle className="text-xl text-white">
                  {perguntaAtual.pergunta}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  switch (perguntaAtual.tipo) {
                    case "single_choice":
                      return (
                        <RadioGroup
                          value={
                            typeof answers[perguntaAtual.id] === "number" ||
                            typeof answers[perguntaAtual.id] === "string"
                              ? answers[perguntaAtual.id].toString()
                              : ""
                          }
                          onValueChange={(value) =>
                            handleAnswerChange(perguntaAtual.id, value)
                          }
                          className="space-y-3"
                        >
                          {perguntaAtual.opcoes.map((opcao) => (
                            <div
                              key={opcao.id}
                              className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-700/30 transition-colors border border-gray-600/30 hover:border-gray-500/50"
                            >
                              <RadioGroupItem
                                value={opcao.valor.toString()}
                                id={opcao.id}
                              />
                              <Label
                                htmlFor={opcao.id}
                                className="flex-1 cursor-pointer text-gray-300 font-medium"
                              >
                                {opcao.texto}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      );
                    case "multiple_choice":
                      return (
                        <div className="space-y-3">
                          {perguntaAtual.opcoes.map((opcao) => {
                            const arr: number[] = Array.isArray(
                              answers[perguntaAtual.id]
                            )
                              ? (answers[perguntaAtual.id] as number[])
                              : [];
                            return (
                              <div
                                key={opcao.id}
                                className="flex items-center gap-3"
                              >
                                <input
                                  type="checkbox"
                                  id={`checkbox-${opcao.id}`}
                                  checked={arr.includes(opcao.valor)}
                                  onChange={(e) => {
                                    setAnswers((prev) => {
                                      const prevArr: number[] = Array.isArray(
                                        prev[perguntaAtual.id]
                                      )
                                        ? (prev[perguntaAtual.id] as number[])
                                        : [];
                                      if (e.target.checked) {
                                        return {
                                          ...prev,
                                          [perguntaAtual.id]: [
                                            ...prevArr,
                                            opcao.valor,
                                          ],
                                        };
                                      } else {
                                        return {
                                          ...prev,
                                          [perguntaAtual.id]: prevArr.filter(
                                            (v) => v !== opcao.valor
                                          ),
                                        };
                                      }
                                    });
                                  }}
                                />
                                <Label
                                  htmlFor={`checkbox-${opcao.id}`}
                                  className="flex-1 cursor-pointer text-gray-300 font-medium"
                                >
                                  {opcao.texto}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      );
                    case "star_rating": {
                      let starValue: number = 0;
                      if (
                        typeof answers[perguntaAtual.id] === "string" &&
                        !isNaN(Number(answers[perguntaAtual.id]))
                      ) {
                        starValue = Number(answers[perguntaAtual.id]);
                      } else if (
                        typeof answers[perguntaAtual.id] === "number"
                      ) {
                        starValue = answers[perguntaAtual.id] as number;
                      }
                      const maxStars = perguntaAtual.max_stars || 5;
                      return (
                        <div className="flex gap-2 items-center">
                          {Array.from(
                            { length: maxStars },
                            (_, i) => i + 1
                          ).map((star) => (
                            <span
                              key={star}
                              role="button"
                              tabIndex={0}
                              aria-label={`Dar ${star} estrela${
                                star > 1 ? "s" : ""
                              }`}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer select-none ${
                                starValue >= star
                                  ? "border-yellow-400 bg-yellow-300/30"
                                  : "border-gray-500 bg-gray-700/30"
                              }`}
                              onClick={() =>
                                handleAnswerChange(
                                  perguntaAtual.id,
                                  String(star)
                                )
                              }
                              onKeyDown={(e) =>
                                (e.key === "Enter" || e.key === " ") &&
                                handleAnswerChange(
                                  perguntaAtual.id,
                                  String(star)
                                )
                              }
                            >
                              <span className="text-yellow-400 font-bold">
                                ★
                              </span>
                            </span>
                          ))}
                        </div>
                      );
                    }
                    case "numeric": {
                      const answerValue = answers[perguntaAtual.id];
                      const safeValue: string | number =
                        typeof answerValue === "number" ||
                        typeof answerValue === "string"
                          ? answerValue
                          : "";
                      return (
                        <input
                          type="number"
                          value={safeValue}
                          onChange={(e) =>
                            handleAnswerChange(perguntaAtual.id, e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
                        />
                      );
                    }
                    case "text_free": {
                      const answerValue = answers[perguntaAtual.id];
                      const safeText: string =
                        typeof answerValue === "string" ? answerValue : "";
                      return (
                        <textarea
                          value={safeText}
                          onChange={(e) =>
                            handleAnswerChange(perguntaAtual.id, e.target.value)
                          }
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white"
                          rows={4}
                        />
                      );
                    }
                    default:
                      return null;
                  }
                })()}

                <div className="flex justify-end mt-8">
                  <EnhancedButton
                    onClick={nextQuestion}
                    disabled={
                      perguntaAtual.tipo === "multiple_choice"
                        ? !(
                            Array.isArray(answers[perguntaAtual.id]) &&
                            (answers[perguntaAtual.id] as number[]).length > 0
                          )
                        : !answers[perguntaAtual.id]
                    }
                    loading={isSubmitting}
                    size="lg"
                  >
                    {currentQuestion === questionario.perguntas.length - 1
                      ? "Finalizar"
                      : "Próxima"}
                  </EnhancedButton>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
