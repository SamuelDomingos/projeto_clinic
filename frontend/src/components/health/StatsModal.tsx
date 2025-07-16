import React from "react"
import AIDiagnosticStats from "@/components/health/AIDiagnosticStats"

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statsData: { stats: Record<string, unknown>; questionMap: Record<string, string> } | null;
}

const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  statsData
}) => {
  if (!isOpen || !statsData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <AIDiagnosticStats stats={statsData.stats} questionMap={statsData.questionMap} />
      </div>
    </div>
  );
};

export default StatsModal; 