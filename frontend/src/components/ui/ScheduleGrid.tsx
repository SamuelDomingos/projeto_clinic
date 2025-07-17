import React from 'react';

interface ScheduleGridProps {
  weekDays: string[];
  hours: string[];
  events?: unknown[]; // Para integração futura
  onCellClick?: (day: string, hour: string) => void;
  renderCell?: (day: string, hour: string) => React.ReactNode;
  getDayLabel?: (day: string) => React.ReactNode;
  getHourLabel?: (hour: string) => React.ReactNode;
<<<<<<< HEAD
  weekOffset?: number; // nova prop
}

const dayNameToIndex: Record<string, number> = {
  'Domingo': 0,
  'Segunda-Feira': 1,
  'Terça-Feira': 2,
  'Quarta-Feira': 3,
  'Quinta-Feira': 4,
  'Sexta-Feira': 5,
  'Sábado': 6,
};

function getStartOfWeek(dayIndex: number, weekOffset = 0) {
  const today = new Date();
  const currentDay = today.getDay();
  // Calcula diferença para o primeiro dia da semana desejado
  const diff = (currentDay - dayIndex + 7) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - diff + weekOffset * 7);
  start.setHours(0, 0, 0, 0);
  return start;
=======
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  weekDays,
  hours,
  events = [],
  onCellClick,
  renderCell,
  getDayLabel,
  getHourLabel,
<<<<<<< HEAD
  weekOffset = 0,
}) => {
  // Descobre o índice do primeiro dia da semana
  const firstDayIndex = dayNameToIndex[weekDays[0]] ?? 1; // padrão: segunda
  const startOfWeek = getStartOfWeek(firstDayIndex, weekOffset);

=======
}) => {
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
  return (
    <div className="overflow-x-auto rounded border bg-white dark:bg-background">
      <div className="min-w-[900px]">
        {/* Header com dias da semana */}
<<<<<<< HEAD
        <div
          className="grid sticky top-0 z-30 bg-background border-b-2"
          style={{ gridTemplateColumns: `100px repeat(${weekDays.length}, 1fr)` }}
        >
          <div className="bg-muted/50 border-r"></div>
          {weekDays.map((day, idx) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + idx);
            const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            return (
              <div key={day} className="bg-muted/50 border-r p-3 text-center">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {getDayLabel ? getDayLabel(day) : day}
                </div>
                <div className="text-lg font-semibold mt-1 text-foreground">{dateLabel}</div>
                <div className="text-xs text-muted-foreground mt-1">0 agendamento(s)</div>
              </div>
            );
          })}
        </div>
        {/* Grid principal com horários */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `100px repeat(${weekDays.length}, 1fr)` }}
        >
=======
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
>>>>>>> 4ae4ac2d3c5f475691a2ea8fcc0e5ebbeb5f8d3b
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