import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Diagnostico {
  satisfacao_geral?: string;
  necessidades_interesses?: string;
  comunicacao_feedback?: string;
  clima_organizacional?: string;
  respostasNumericas?: number;
  respostasAbertas?: number;
  mediaGeral?: number;
  distribuicaoGeral?: string;
  pontosDeMelhoria?: string[];
  [key: string]: unknown;
}

interface Props {
  diagnostico: Diagnostico | string;
}

const AIDiagnosticCard: React.FC<Props> = ({ diagnostico }) => {

  if (!diagnostico) return null;

  // Se vier como string, exibe como texto simples
  if (typeof diagnostico === 'string') {
    return (
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-blue-300 text-base flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Diagnóstico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-gray-100 text-sm mt-1">{diagnostico}</div>
        </CardContent>
      </Card>
    );
  }

  const hasMain = diagnostico.satisfacao_geral || diagnostico.necessidades_interesses || diagnostico.comunicacao_feedback || diagnostico.clima_organizacional;
  const hasGeneric = diagnostico.respostasNumericas !== undefined || diagnostico.respostasAbertas !== undefined || diagnostico.mediaGeral !== undefined || diagnostico.distribuicaoGeral !== undefined;

  return (
    <Card className="bg-gray-800/50 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-blue-300 text-base flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          Diagnóstico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Campos principais */}
        {diagnostico.satisfacao_geral && (
          <div>
            <Badge className="bg-blue-700/30 text-blue-200 mb-1">Satisfação geral</Badge>
            <div className="text-gray-100 text-sm mt-1">{diagnostico.satisfacao_geral}</div>
          </div>
        )}
        {diagnostico.necessidades_interesses && (
          <div>
            <Badge className="bg-green-700/30 text-green-200 mb-1">Necessidades/Interesses</Badge>
            <div className="text-gray-100 text-sm mt-1">{diagnostico.necessidades_interesses}</div>
          </div>
        )}
        {diagnostico.comunicacao_feedback && (
          <div>
            <Badge className="bg-yellow-700/30 text-yellow-200 mb-1">Comunicação/Feedback</Badge>
            <div className="text-gray-100 text-sm mt-1">{diagnostico.comunicacao_feedback}</div>
          </div>
        )}
        {diagnostico.clima_organizacional && (
          <div>
            <Badge className="bg-purple-700/30 text-purple-200 mb-1">Clima organizacional</Badge>
            <div className="text-gray-100 text-sm mt-1">{diagnostico.clima_organizacional}</div>
          </div>
        )}
        {/* Campos genéricos se não houver principais */}
        {!hasMain && hasGeneric && (
          <div className="space-y-2">
            {diagnostico.respostasNumericas !== undefined && (
              <div>
                <Badge className="bg-blue-700/30 text-blue-200 mb-1">Respostas numéricas</Badge>
                <span className="text-gray-100 text-sm ml-2">{diagnostico.respostasNumericas}</span>
              </div>
            )}
            {diagnostico.respostasAbertas !== undefined && (
              <div>
                <Badge className="bg-yellow-700/30 text-yellow-200 mb-1">Respostas abertas</Badge>
                <span className="text-gray-100 text-sm ml-2">{diagnostico.respostasAbertas}</span>
              </div>
            )}
            {diagnostico.mediaGeral !== undefined && (
              <div>
                <Badge className="bg-green-700/30 text-green-200 mb-1">Média geral</Badge>
                <span className="text-gray-100 text-sm ml-2">{diagnostico.mediaGeral}</span>
              </div>
            )}
            {diagnostico.distribuicaoGeral && (
              <div>
                <Badge className="bg-purple-700/30 text-purple-200 mb-1">Distribuição geral</Badge>
                <span className="text-gray-100 text-sm ml-2">{diagnostico.distribuicaoGeral}</span>
              </div>
            )}
          </div>
        )}
        {/* Se nenhum campo, mostra mensagem padrão */}
        {!hasMain && !hasGeneric && (
          <div className="text-gray-400 text-sm">Diagnóstico não disponível.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIDiagnosticCard; 