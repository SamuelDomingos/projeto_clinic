import React from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Target } from "lucide-react"

interface DiagnosticResult {
  id?: number;
  questionnaireId: number;
  created_at?: string;
  ia_diagnostic?: string;
  analise?: {
    id: number;
    questionnaire_id: number;
    responses_snapshot: unknown[];
    ia_statistics: Record<string, unknown>;
    ia_diagnostic: string;
    ia_action_plan: unknown;
    ia_conversation_history: unknown;
    created_at: string;
  };
  error?: string;
}

interface ActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedDiagnostic: string | null;
  setSelectedDiagnostic: (value: string | null) => void;
  diagnostics: DiagnosticResult[];
}

const ActionPlanModal: React.FC<ActionPlanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedDiagnostic,
  setSelectedDiagnostic,
  diagnostics
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-white mb-4">Selecione o diagnóstico</h2>
        <Select
          value={selectedDiagnostic ?? ""}
          onValueChange={value => setSelectedDiagnostic(value)}
        >
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {diagnostics.map((diag, idx) => {
              const id = diag.id != null
                ? String(diag.id)
                : diag.analise && diag.analise.id != null
                  ? String(diag.analise.id)
                  : diag.questionnaireId
                    ? String(diag.questionnaireId)
                    : `idx-${idx}`;
              const createdAt = diag.created_at || diag.analise?.created_at;
              return (
                <SelectItem key={id} value={id}>
                  {createdAt
                    ? `Criado em: ${new Date(createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`
                    : `Diagnóstico #${id}`}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Button
          className="w-full"
          onClick={onConfirm}
          disabled={!selectedDiagnostic}
        >
          <Target className="w-4 h-4 mr-2" />
          Gerar Plano de Ação
        </Button>
      </div>
    </div>
  );
};

export default ActionPlanModal; 