import React from 'react';

interface ScheduleGridProps {
  weekDays: string[];
  hours: string[];
  events?: unknown[]; // Para integração futura
  onCellClick?: (day: string, hour: string) => void;
  renderCell?: (day: string, hour: string) => React.ReactNode;
  getDayLabel?: (day: string) => React.ReactNode;
  getHourLabel?: (hour: string) => React.ReactNode;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  weekDays,
  hours,
  events = [],
  onCellClick,
  renderCell,
  getDayLabel,
  getHourLabel,
}) => {
  return (
    <div className="overflow-x-auto rounded border bg-white dark:bg-background">
      <div className="min-w-[900px]">
        {/* Header com dias da semana */}
        <div className={`grid grid-cols-[100px_repeat(${weekDays.length},1fr)] sticky top-0 z-30 bg-background border-b-2`}>
          <div className="bg-muted/50 border-r"></div>
          {weekDays.map((day, idx) => (
            <div key={day} className="bg-muted/50 border-r p-3 text-center">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {getDayLabel ? getDayLabel(day) : day}
              </div>
              {/* Placeholder para data/contagem de eventos */}
              <div className="text-lg font-semibold mt-1 text-foreground">-</div>
              <div className="text-xs text-muted-foreground mt-1">0 agendamento(s)</div>
            </div>
          ))}
        </div>
        {/* Grid principal com horários */}
        <div className={`grid grid-cols-[100px_repeat(${weekDays.length},1fr)]`}>
          {/* Coluna de horários */}
          <div className="sticky left-0 z-20 bg-background border-r">
            {hours.map(hour => (
              <div key={hour} className="h-10 border-b flex items-start justify-center pt-2">
                <div className="text-sm font-medium text-muted-foreground bg-background px-2">
                  {getHourLabel ? getHourLabel(hour) : hour}
                </div>
              </div>
            ))}
          </div>
          {/* Colunas dos dias */}
          {weekDays.map(day => (
            <div key={day} className="border-r relative">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="h-10 border-b relative group cursor-pointer transition-colors hover:bg-muted/20"
                  onClick={() => onCellClick && onCellClick(day, hour)}
                >
                  {renderCell ? renderCell(day, hour) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid; 