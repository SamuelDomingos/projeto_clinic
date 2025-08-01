import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, MessageSquare, Users, ChevronDown, ChevronUp, Star, Hash, List, CheckSquare } from 'lucide-react';

interface Distribuicao { [key: string]: number; }
interface Estatisticas {
  distribuicao_respostas?: Record<string, Distribuicao>;
  media_respostas_numericas?: Record<string, number>;
  respostas_texto?: Record<string, string>;
  probabilidade?: Record<string, { quantidade: number; porcentagem: number }>;
}

interface PerguntaComRespostas {
  question_id: number;
  order_index: number;
  question_text: string;
  question_type: string;
  options: string | null;
  responses?: (string | number | string[] | number[]);
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface Props {
  stats: Estatisticas;
  questionMap?: Record<string, string>;
}

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

function getOptionText(options: string | null, index: string | number): string | number {
  if (!options) return index;
  try {
    const opts = JSON.parse(options);
    if (Array.isArray(opts) && opts[Number(index)] !== undefined) {
      return opts[Number(index)];
    }
  } catch {
    // fallback
  }
  return index;
}

// Função para detectar o tipo de pergunta automaticamente
function detectQuestionType(meta: PerguntaComRespostas | null, distributionData: ChartDataItem[] | null, hasAverage: boolean): string {
  if (!meta) {
    if (hasAverage) return 'numeric';
    return 'text_free';
  }
  
  // Se tem question_type definido, usa ele
  if (meta.question_type) {
    return meta.question_type;
  }
  
  // Detecta baseado nos dados
  if (distributionData && distributionData.length > 0) {
    const keys = distributionData.map(d => d.name);
    
    // Se as chaves são números de 0-10, provavelmente é star_rating
    if (keys.every(k => !isNaN(Number(k)) && Number(k) >= 0 && Number(k) <= 10)) {
      return 'star_rating';
    }
    
    // Se tem muitas opções (>5), provavelmente é multiple_choice
    if (keys.length > 5) {
      return 'multiple_choice';
    }
    
    // Se tem poucas opções (2-5), provavelmente é single_choice
    if (keys.length <= 5) {
      return 'single_choice';
    }
  }
  
  if (hasAverage) {
    return 'numeric';
  }
  
  return 'text_free';
}

// Componente para renderizar cada tipo de pergunta
const QuestionRenderer: React.FC<{
  pergunta: string;
  perguntaKey: string;
  type: string;
  data: ChartDataItem[] | null;
  average?: number;
  textResponse?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}> = ({ pergunta, perguntaKey, type, data, average, textResponse, isCollapsed, onToggle }) => {
  
  const getIcon = () => {
    switch(type) {
      case 'star_rating': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'numeric': return <Hash className="w-4 h-4 text-blue-400" />;
      case 'single_choice': return <Users className="w-4 h-4 text-green-400" />;
      case 'multiple_choice': return <CheckSquare className="w-4 h-4 text-purple-400" />;
      case 'text_free': return <MessageSquare className="w-4 h-4 text-orange-400" />;
      default: return <List className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = () => {
    switch(type) {
      case 'star_rating': return 'Avaliação por Estrelas';
      case 'numeric': return 'Resposta Numérica';
      case 'single_choice': return 'Escolha Única';
      case 'multiple_choice': return 'Múltipla Escolha';
      case 'text_free': return 'Texto Livre';
      default: return 'Pergunta';
    }
  };

  const renderContent = () => {
    if (type === 'text_free' && textResponse) {
      return (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/20">
          <div className="text-sm text-gray-200">{textResponse}</div>
        </div>
      );
    }

    if (type === 'numeric' && average !== undefined) {
      return (
        <div className="flex items-center justify-center h-24">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{average.toFixed(1)}</div>
            <div className="text-sm text-gray-400">Média</div>
          </div>
        </div>
      );
    }

    if (type === 'star_rating' && data) {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151', 
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if ((type === 'single_choice' || type === 'multiple_choice') && data) {
      return (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1">
            {data.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-300 truncate flex-1">{entry.name}</span>
                <span className="text-gray-400">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="h-[150px] flex items-center justify-center text-gray-400 text-sm">
        Sem dados para exibir
      </div>
    );
  };

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          {getIcon()}
          <div>
            <h4 className="text-sm font-medium text-white">{pergunta}</h4>
            <span className="text-xs text-gray-400">{getTypeLabel()}</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-600/50 transition-colors"
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          {isCollapsed ? 'Expandir' : 'Colapsar'}
        </button>
      </div>
      
      {!isCollapsed && renderContent()}
    </div>
  );
};

const AIDiagnosticStats: React.FC<Props> = ({ stats, questionMap }) => {
  console.log('[AIDiagnosticStats] stats:', stats);
  console.log('[AIDiagnosticStats] questionMap:', questionMap);
  
  const [collapsedQuestions, setCollapsedQuestions] = useState<Set<string>>(new Set());
  const [globalCollapsed, setGlobalCollapsed] = useState(false);
  
  // Busca perguntasComRespostas do questionMap
  let perguntasComRespostas: PerguntaComRespostas[] = [];
  if (questionMap && (questionMap as any)._perguntasComRespostas) {
    perguntasComRespostas = (questionMap as any)._perguntasComRespostas;
    console.log('[AIDiagnosticStats] perguntasComRespostas:', perguntasComRespostas);
  }

  // Busca a pergunta pela question_id
  function getPerguntaMeta(perguntaKey: string) {
    if (!perguntasComRespostas.length) return null;
    
    // As chaves dos dados correspondem ao question_id
    const questionId = Number(perguntaKey);
    return perguntasComRespostas.find(p => p.question_id === questionId) || null;
  }

  const toggleQuestion = (perguntaKey: string) => {
    const newCollapsed = new Set(collapsedQuestions);
    if (newCollapsed.has(perguntaKey)) {
      newCollapsed.delete(perguntaKey);
    } else {
      newCollapsed.add(perguntaKey);
    }
    setCollapsedQuestions(newCollapsed);
  };

  const toggleGlobal = () => {
    setGlobalCollapsed(!globalCollapsed);
    if (!globalCollapsed) {
      // Colapsar todas
      const allKeys = new Set([
        ...Object.keys(stats.distribuicao_respostas || {}),
        ...Object.keys(stats.media_respostas_numericas || {}),
        ...Object.keys(stats.respostas_texto || {})
      ]);
      setCollapsedQuestions(allKeys);
    } else {
      // Expandir todas
      setCollapsedQuestions(new Set());
    }
  };

  // Processa todas as perguntas
  const allQuestions = new Map();

  // Adiciona distribuições
  if (stats.distribuicao_respostas) {
    Object.entries(stats.distribuicao_respostas).forEach(([key, value]) => {
      const meta = getPerguntaMeta(key);
      const data: ChartDataItem[] = Object.entries(value).map(([k, v], idx) => ({
        name: String(meta && meta.options ? getOptionText(meta.options, k) : k),
        value: v,
        color: colors[idx % colors.length]
      }));
      
      allQuestions.set(key, {
        pergunta: meta ? meta.question_text : `Pergunta ${key}`,
        perguntaKey: key,
        meta,
        data,
        type: detectQuestionType(meta, data, false)
      });
    });
  }

  // Adiciona médias
  if (stats.media_respostas_numericas) {
    Object.entries(stats.media_respostas_numericas).forEach(([key, value]) => {
      const meta = getPerguntaMeta(key);
      const existing = allQuestions.get(key);
      
      if (existing) {
        existing.average = value;
        existing.type = detectQuestionType(meta, existing.data, true);
      } else {
        allQuestions.set(key, {
          pergunta: meta ? meta.question_text : `Pergunta ${key}`,
          perguntaKey: key,
          meta,
          average: value,
          type: detectQuestionType(meta, null, true)
        });
      }
    });
  }

  // Adiciona respostas de texto
  if (stats.respostas_texto) {
    Object.entries(stats.respostas_texto).forEach(([key, value]) => {
      const meta = getPerguntaMeta(key);
      const existing = allQuestions.get(key);
      
      if (existing) {
        existing.textResponse = value;
        existing.type = 'text_free';
      } else {
        allQuestions.set(key, {
          pergunta: meta ? meta.question_text : `Pergunta ${key}`,
          perguntaKey: key,
          meta,
          textResponse: value,
          type: 'text_free'
        });
      }
    });
  }

  const questionsArray = Array.from(allQuestions.values());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Estatísticas das Respostas</h3>
        </div>
        <button
          onClick={toggleGlobal}
          className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-600/50 transition-colors"
        >
          {globalCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          {globalCollapsed ? 'Expandir Todas' : 'Colapsar Todas'}
        </button>
      </div>

      {/* Probabilidades */}
      {stats.probabilidade && (
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg p-4 border border-green-500/30 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Probabilidades de Diagnóstico</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(stats.probabilidade).map(([categoria, dados]) => (
              <div key={categoria} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/20">
                <div className="text-sm font-medium text-white capitalize mb-1">{categoria}</div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">{dados.quantidade} pessoas</div>
                  <div className="text-lg font-bold text-green-400">{dados.porcentagem}%</div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dados.porcentagem}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perguntas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {questionsArray.map((question) => (
          <QuestionRenderer
            key={question.perguntaKey}
            pergunta={question.pergunta}
            perguntaKey={question.perguntaKey}
            type={question.type}
            data={question.data}
            average={question.average}
            textResponse={question.textResponse}
            isCollapsed={collapsedQuestions.has(question.perguntaKey)}
            onToggle={() => toggleQuestion(question.perguntaKey)}
          />
        ))}
      </div>

      {/* Resumo Geral */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">{questionsArray.length}</div>
            <div className="text-xs text-gray-400">Total de Perguntas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {questionsArray.filter(q => q.type === 'star_rating').length}
            </div>
            <div className="text-xs text-gray-400">Avaliações</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {questionsArray.filter(q => q.type === 'single_choice' || q.type === 'multiple_choice').length}
            </div>
            <div className="text-xs text-gray-400">Escolhas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {questionsArray.filter(q => q.type === 'numeric').length}
            </div>
            <div className="text-xs text-gray-400">Numéricas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {questionsArray.filter(q => q.type === 'text_free').length}
            </div>
            <div className="text-xs text-gray-400">Texto Livre</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDiagnosticStats;