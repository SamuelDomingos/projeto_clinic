import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, Lock } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import ScheduleGrid from '@/components/ui/ScheduleGrid';
import type { AttendanceSchedule } from '@/lib/api/types/attendanceSchedule';
import type { User } from '@/lib/api/types/common';
import { useScheduleConfig } from '@/contexts/ScheduleConfigContext';

// Função para obter cores baseadas no tema
function getThemeColors(isDark: boolean) {
  return {
    appointment: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(191, 219, 254, 0.8)',
    appointmentBorder: isDark ? 'rgba(59, 130, 246, 0.6)' : 'rgba(147, 197, 253, 1)',
    blocked: isDark ? 'rgba(107, 114, 128, 0.4)' : 'rgba(209, 213, 219, 0.8)',
    blockedBorder: isDark ? 'rgba(107, 114, 128, 0.7)' : 'rgba(156, 163, 175, 1)',
    text: isDark ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
    textMuted: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
  };
}

// Função corrigida para converter horário em minutos (aceita HH:MM:SS)
function timeToMinutes(time: string): number {
  // Validar se o time existe e não é undefined/null
  if (!time || typeof time !== 'string') {
    console.warn('timeToMinutes: valor de tempo inválido:', time);
    return 0; // Retorna 0 como fallback
  }
  
  const timeParts = time.split(':');
  const hours = parseInt(timeParts[0]) || 0;
  const minutes = parseInt(timeParts[1]) || 0;
  return hours * 60 + minutes;
}

// Função corrigida para calcular a posição do agendamento no grid
function calculateAppointmentPosition(appointment: AttendanceSchedule, hours: string[], weekDays: string[], startOfGridWeek: Date, blockInterval: number) {
  // Validar se o appointment tem os campos necessários
  if (!appointment.startTime || !appointment.endTime) {
    console.warn('calculateAppointmentPosition: agendamento sem horários válidos:', appointment);
    return null;
  }
  
  // Corrigir o cálculo da data do agendamento
  const appointmentDate = new Date(appointment.date + 'T00:00:00');
  
  // Encontrar o índice correto do dia
  let dayIndex = -1;
  for (let i = 0; i < weekDays.length; i++) {
    const gridDate = new Date(startOfGridWeek);
    gridDate.setDate(startOfGridWeek.getDate() + i);
    
    if (appointmentDate.getFullYear() === gridDate.getFullYear() &&
        appointmentDate.getMonth() === gridDate.getMonth() &&
        appointmentDate.getDate() === gridDate.getDate()) {
      dayIndex = i;
      break;
    }
  }
  
  if (dayIndex === -1) return null;
  
  // Converter os horários (removendo segundos se existirem)
  const startMinutes = timeToMinutes(appointment.startTime);
  const endMinutes = timeToMinutes(appointment.endTime);
  
  // Validar se os horários foram convertidos corretamente
  if (startMinutes === 0 && endMinutes === 0) {
    console.warn('calculateAppointmentPosition: horários convertidos para 0:', appointment);
    return null;
  }
  
  // Usar o blockInterval da configuração em vez de assumir 30 minutos
  const intervalMinutes = blockInterval;
  
  // Encontrar posição no grid baseada nos horários disponíveis
  const firstHourMinutes = timeToMinutes(hours[0]);
  
  // Calcular quantos slots desde o início do grid
  const minutesFromGridStart = startMinutes - firstHourMinutes;
  const slotsFromStart = minutesFromGridStart / intervalMinutes;
  
  // Altura ajustada: cada slot do grid tem 40px, mas queremos que o intervalo configurado = 80-100px
  const GRID_SLOT_HEIGHT = 40; // altura real do slot no grid
  const APPOINTMENT_SLOT_HEIGHT = 80; // altura desejada para o intervalo configurado (entre 80-100)
  
  const topPosition = Math.max(0, slotsFromStart * GRID_SLOT_HEIGHT);
  
  // Calcular altura baseada na duração com proporção ajustada
  const durationMinutes = endMinutes - startMinutes;
  const durationSlots = durationMinutes / intervalMinutes;
  
  // Para agendamentos curtos (até 2 horas), usar altura maior para melhor visualização
  // Para agendamentos longos, usar altura do grid para não ultrapassar
  const isShortAppointment = durationMinutes <= 120; // até 2 horas
  const slotHeight = isShortAppointment ? APPOINTMENT_SLOT_HEIGHT : GRID_SLOT_HEIGHT;
let height = durationSlots * slotHeight;

if (!isShortAppointment && endMinutes % intervalMinutes === 0) {
  height += slotHeight; // adiciona só 1 slot pros longos que terminam certinho no fim de um intervalo
}
  
  return {
    dayIndex,
    topPosition,
    height
  };
}

interface ScheduleViewProps {
  weekDays: string[];
  hours: string[];
  schedules: AttendanceSchedule[];
  healthProfessionals: User[];
  selectedDoctors: string[];
  weekOffset: number;
  onNewAppointment: () => void;
  onEditAppointment: (appointment: AttendanceSchedule) => void;
  onWeekChange: (offset: number) => void;
}

export default function ScheduleView({
  weekDays,
  hours,
  schedules,
  healthProfessionals,
  selectedDoctors,
  weekOffset,
  onNewAppointment,
  onEditAppointment,
  onWeekChange
}: ScheduleViewProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { config } = useScheduleConfig(); // Obter a configuração

  console.log(schedules);
  
  
  // Detectar modo escuro
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Observer para mudanças na classe dark
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Calcular os dias da semana baseados no contexto e offset
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
    const diff = (currentDay - dayIndex + 7) % 7;
    const start = new Date(today);
    start.setDate(today.getDate() - diff + weekOffset * 7);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  const firstDayIndex = dayNameToIndex[weekDays[0]] ?? 1;
  const startOfGridWeek = getStartOfWeek(firstDayIndex, weekOffset);

  function getWeekLabel() {
    if (!weekDays.length) return '';
    const firstDayIndex = dayNameToIndex[weekDays[0]] ?? 1;
    const start = getStartOfWeek(firstDayIndex, weekOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + weekDays.length - 1);
    return `${start.getDate()} – ${end.getDate()} de ${end.toLocaleDateString('pt-BR', { month: 'short' })}`;
  }

  // Funções auxiliares para manipular os agendamentos
  function getDateFromDayName(dayName: string, weekDays: string[], startOfGridWeek: Date) {
    const idx = weekDays.indexOf(dayName);
    const date = new Date(startOfGridWeek);
    date.setDate(startOfGridWeek.getDate() + idx);
    return date;
  }

  const getSchedulesForWeek = () => {
    return (schedules || []).filter((item) => {
      const matchesDoctor = selectedDoctors.length === 0 || 
                         (item.professional?.id && selectedDoctors.includes(item.professional.id));
      // Remover filtro isNotBlocked para incluir bloqueios
      
      // Verificar se a data está na semana atual
      const itemDate = new Date(item.date + 'T00:00:00');
      const weekStart = new Date(startOfGridWeek);
      const weekEnd = new Date(startOfGridWeek);
      weekEnd.setDate(weekStart.getDate() + weekDays.length - 1);
      weekEnd.setHours(23, 59, 59, 999);
      
      const isInWeek = itemDate >= weekStart && itemDate <= weekEnd;
      
      return matchesDoctor && isInWeek;
    });
  };

  const getBlockedForSlot = (day: Date, time: string, doctorId: string) => {
    const formattedDay = format(day, "yyyy-MM-dd");
    return schedules.filter((item) => {
      const isBlocked = item.isBlocked;
      const matchesDate = item.date === formattedDay;
      const matchesDoctor = !doctorId || item.professional?.id === doctorId;
      
      const timeInMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
      const startInMinutes = parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1]);
      const endInMinutes = parseInt(item.endTime.split(':')[0]) * 60 + parseInt(item.endTime.split(':')[1]);
      
      const matchesTime = timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
      
      return isBlocked && matchesDate && matchesDoctor && matchesTime;
    });
  };

  const weekSchedules = getSchedulesForWeek();
  const themeColors = getThemeColors(isDarkMode);

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="bg-white dark:bg-background rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Agenda</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onWeekChange(weekOffset - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-sm">{getWeekLabel()}</span>
            <Button variant="outline" size="sm" onClick={() => onWeekChange(weekOffset + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onWeekChange(0)}>Hoje</Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"></span> 
              Agendamento
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500"></span> 
              Bloqueado
            </span>
          </div>
          <Button onClick={onNewAppointment}>
            <Plus className="h-4 w-4 mr-2" />
            Agendar
          </Button>
        </div>
      </div>
      
      {/* Container do grid com agendamentos sobrepostos */}
      <div className="relative bg-white dark:bg-background rounded-lg border overflow-hidden">
        {/* Grid da agenda */}
        <ScheduleGrid
          weekDays={weekDays}
          hours={hours}
          renderCell={(day, hour) => {
            // Remover a renderização de bloqueios aqui, pois agora serão renderizados como agendamentos
            return null;
          }}
          onCellClick={(day, hour) => {
            if (selectedDoctors.length > 0) {
              onNewAppointment();
            }
          }}
          weekOffset={weekOffset}
        />
        
        {/* Overlay para agendamentos - posicionado sobre o grid */}
        <div className="absolute inset-0 pointer-events-none">
          
          {/* Container dos agendamentos */}
          <div className="relative h-full">
            {weekSchedules.map((appointment) => {
              // Usar o blockInterval da configuração
              const blockInterval = config?.blockInterval || 30;
              const position = calculateAppointmentPosition(appointment, hours, weekDays, startOfGridWeek, blockInterval);
              
              if (!position) return null;
              
              const doctorName = appointment.professional?.name || 'Profissional';
              const patientName = appointment.patient?.name || 'Paciente';
              const isProtocol = appointment.attendanceType === 'protocolo';
              const isBlocked = appointment.isBlocked;
              
              return (
                <div
                  key={appointment.id}
                  className="absolute pointer-events-auto cursor-pointer hover:shadow-lg transition-all duration-200 border group overflow-hidden rounded-md z-30"
                  style={{
                    backgroundColor: isBlocked
                      ? themeColors.blocked
                      : isProtocol 
                        ? (isDarkMode ? 'rgba(34, 197, 94, 0.25)' : 'rgba(167, 243, 208, 0.9)')
                        : themeColors.appointment,
                    borderColor: isBlocked
                      ? themeColors.blockedBorder
                      : isProtocol 
                        ? (isDarkMode ? 'rgba(34, 197, 94, 0.5)' : 'rgba(110, 231, 183, 1)')
                        : themeColors.appointmentBorder,
                    color: themeColors.text,
                    // Posicionamento baseado no grid
                    left: `calc(100px + (100% - 100px) / ${weekDays.length} * ${position.dayIndex} + 4px)`,
                    width: `calc((100% - 100px) / ${weekDays.length} - 8px)`,
                    top: `${position.topPosition + 80}px`, // Adicionar offset do header
                    height: `${position.height}px`,
                    minHeight: '32px'
                  }}
                  onClick={() => onEditAppointment(appointment)}
                >
                  <div className="p-1.5 h-full flex flex-col justify-between">
                    <div className="flex-1 min-h-0">
                      <div className="text-xs font-bold leading-tight mb-1 truncate flex items-center gap-1" style={{ color: themeColors.text }}>
                        {isBlocked && (
                          <Lock className="h-3 w-3 flex-shrink-0" />
                        )}
                        {appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)}
                      </div>
                      <div className="text-xs truncate" style={{ color: themeColors.textMuted }}>
                        {isBlocked ? doctorName : patientName}
                      </div>
                      {isBlocked && appointment.observation && (
                        <div className="text-xs truncate mt-1" style={{ color: themeColors.textMuted }}>
                          {appointment.observation}
                        </div>
                      )}
                    </div>
                    {!isBlocked && appointment.attendanceType && position.height > 50 && (
                      <div className="text-xs mt-1 flex-shrink-0">
                        <span className="px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-medium">
                          {isProtocol ? 'Protocolo' : 'Consulta'}
                        </span>
                      </div>
                    )}
                    {isBlocked && (
                      <div className="text-xs mt-1 flex-shrink-0">
                        <span className="px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-xs font-medium">
                          Bloqueado
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}