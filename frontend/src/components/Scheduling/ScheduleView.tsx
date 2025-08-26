import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, Lock } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import ScheduleGrid from "@/components/ui/ScheduleGrid";
import type { AttendanceSchedule } from "@/lib/api/types/attendanceSchedule";
import type { User } from "@/lib/api/types/common";
import { useScheduleConfig } from "@/contexts/ScheduleConfigContext";
import { SchedulingHeader } from "../Scheduling";

// Função para obter cores baseadas no tema
function getThemeColors(isDark: boolean) {
  return {
    appointment: isDark
      ? "rgba(59, 130, 246, 0.3)"
      : "rgba(191, 219, 254, 0.8)",
    appointmentBorder: isDark
      ? "rgba(59, 130, 246, 0.6)"
      : "rgba(147, 197, 253, 1)",
    blocked: isDark ? "rgba(107, 114, 128, 0.4)" : "rgba(209, 213, 219, 0.8)",
    blockedBorder: isDark
      ? "rgba(107, 114, 128, 0.7)"
      : "rgba(156, 163, 175, 1)",
    text: isDark ? "rgb(243, 244, 246)" : "rgb(17, 24, 39)",
    textMuted: isDark ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
  };
}

// Função corrigida para converter horário em minutos (aceita HH:MM:SS)
function timeToMinutes(time: string): number {
  // Validar se o time existe e não é undefined/null
  if (!time || typeof time !== "string") {
    console.warn("timeToMinutes: valor de tempo inválido:", time);
    return 0; // Retorna 0 como fallback
  }

  const timeParts = time.split(":");
  const hours = parseInt(timeParts[0]) || 0;
  const minutes = parseInt(timeParts[1]) || 0;
  return hours * 60 + minutes;
}

// Função corrigida para calcular a posição do agendamento no grid
function calculateAppointmentPosition(
  appointment: AttendanceSchedule,
  hours: string[],
  weekDays: string[],
  startOfGridWeek: Date,
  blockInterval: number
) {
  // Validar se o appointment tem os campos necessários
  if (!appointment.startTime || !appointment.endTime) {
    console.warn(
      "calculateAppointmentPosition: agendamento sem horários válidos:",
      appointment
    );
    return null;
  }

  // Corrigir o cálculo da data do agendamento
  const appointmentDate = new Date(appointment.date + "T00:00:00");

  // Encontrar o índice correto do dia
  let dayIndex = -1;
  for (let i = 0; i < weekDays.length; i++) {
    const gridDate = new Date(startOfGridWeek);
    gridDate.setDate(startOfGridWeek.getDate() + i);

    if (
      appointmentDate.getFullYear() === gridDate.getFullYear() &&
      appointmentDate.getMonth() === gridDate.getMonth() &&
      appointmentDate.getDate() === gridDate.getDate()
    ) {
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
    console.warn(
      "calculateAppointmentPosition: horários convertidos para 0:",
      appointment
    );
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
  const slotHeight = isShortAppointment
    ? APPOINTMENT_SLOT_HEIGHT
    : GRID_SLOT_HEIGHT;
  let height = durationSlots * slotHeight;

  if (!isShortAppointment && endMinutes % intervalMinutes === 0) {
    height += slotHeight; // adiciona só 1 slot pros longos que terminam certinho no fim de um intervalo
  }

  return {
    dayIndex,
    topPosition,
    height,
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
  units: Array<{ id: string; name: string }>;
  selectedUnit: string;
  onUnitChange: (unitId: string) => void;
}

function ScheduleView({
  weekDays,
  hours,
  schedules,
  healthProfessionals,
  selectedDoctors,
  weekOffset,
  onNewAppointment,
  onEditAppointment,
  onWeekChange,
  units,
  selectedUnit,
  onUnitChange,
}: ScheduleViewProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { config } = useScheduleConfig(); // Obter a configuração

  // Detectar modo escuro
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Observer para mudanças na classe dark
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Calcular os dias da semana baseados no contexto e offset
  const dayNameToIndex: Record<string, number> = {
    Domingo: 0,
    "Segunda-Feira": 1,
    "Terça-Feira": 2,
    "Quarta-Feira": 3,
    "Quinta-Feira": 4,
    "Sexta-Feira": 5,
    Sábado: 6,
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

  const getWeekLabel = () => {
    if (!weekDays.length) return "";
    const firstDayIndex = dayNameToIndex[weekDays[0]] ?? 1;
    const start = getStartOfWeek(firstDayIndex, weekOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + weekDays.length - 1);
    return `${start.getDate()} – ${end.getDate()} de ${end.toLocaleDateString(
      "pt-BR",
      { month: "short" }
    )}`;
  };

  // Funções auxiliares para manipular os agendamentos
  function getDateFromDayName(
    dayName: string,
    weekDays: string[],
    startOfGridWeek: Date
  ) {
    const idx = weekDays.indexOf(dayName);
    const date = new Date(startOfGridWeek);
    date.setDate(startOfGridWeek.getDate() + idx);
    return date;
  }

  const getSchedulesForWeek = () => {
    return (schedules || []).filter((item) => {
      const matchesDoctor =
        selectedDoctors.length === 0 ||
        (item.professional?.id &&
          selectedDoctors.includes(item.professional.id));
      // Remover filtro isNotBlocked para incluir bloqueios

      // Verificar se a data está na semana atual
      const itemDate = new Date(item.date + "T00:00:00");
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

      const timeInMinutes =
        parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
      const startInMinutes =
        parseInt(item.startTime.split(":")[0]) * 60 +
        parseInt(item.startTime.split(":")[1]);
      const endInMinutes =
        parseInt(item.endTime.split(":")[0]) * 60 +
        parseInt(item.endTime.split(":")[1]);

      const matchesTime =
        timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;

      return isBlocked && matchesDate && matchesDoctor && matchesTime;
    });
  };

  const weekSchedules = getSchedulesForWeek();
  const themeColors = getThemeColors(isDarkMode);

  // Função para detectar conflitos de agendamentos no mesmo horário
  const detectTimeConflicts = (
    appointments: AttendanceSchedule[],
    hours: string[],
    weekDays: string[],
    startOfGridWeek: Date,
    blockInterval: number
  ) => {
    const conflicts: Record<string, AttendanceSchedule[]> = {};

    appointments.forEach((appointment, index) => {
      const position = calculateAppointmentPosition(
        appointment,
        hours,
        weekDays,
        startOfGridWeek,
        blockInterval
      );
      if (!position) return;

      const key = `${position.dayIndex}-${Math.floor(
        position.topPosition / 40
      )}`; // Agrupar por dia e slot de tempo

      if (!conflicts[key]) {
        conflicts[key] = [];
      }
      conflicts[key].push(appointment);
    });

    // Retornar apenas os grupos que têm mais de 1 agendamento
    const actualConflicts: Record<string, AttendanceSchedule[]> = {};
    Object.keys(conflicts).forEach((key) => {
      if (conflicts[key].length > 1) {
        actualConflicts[key] = conflicts[key];
      }
    });

    return actualConflicts;
  };

  // Função para calcular posição e largura considerando conflitos
  const calculateAppointmentPositionWithConflicts = (
    appointment: AttendanceSchedule,
    hours: string[],
    weekDays: string[],
    startOfGridWeek: Date,
    blockInterval: number,
    conflicts: Record<string, AttendanceSchedule[]>
  ) => {
    const basePosition = calculateAppointmentPosition(
      appointment,
      hours,
      weekDays,
      startOfGridWeek,
      blockInterval
    );
    if (!basePosition) return null;

    const key = `${basePosition.dayIndex}-${Math.floor(
      basePosition.topPosition / 40
    )}`;
    const conflictGroup = conflicts[key];

    if (!conflictGroup || conflictGroup.length <= 1) {
      return {
        ...basePosition,
        widthPercentage: 100,
        offsetPercentage: 0,
      };
    }

    // Encontrar o índice deste agendamento no grupo de conflitos
    const appointmentIndex = conflictGroup.findIndex(
      (a) => a.id === appointment.id
    );
    const totalConflicts = conflictGroup.length;

    // Calcular largura e offset
    const widthPercentage = 100 / totalConflicts;
    const offsetPercentage = appointmentIndex * widthPercentage;

    return {
      ...basePosition,
      widthPercentage,
      offsetPercentage,
    };
  };

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      {/* <div className="bg-white dark:bg-background rounded-lg shadow-sm border p-4">
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
      
      </div> */}

      {/* Integração com o componente Scheduling */}
      <SchedulingHeader
        selectedDoctors={selectedDoctors}
        doctors={healthProfessionals}
        weekDays={weekDays}
        weekOffset={weekOffset}
        onWeekChange={onWeekChange}
        getWeekLabel={getWeekLabel}
        onSchedule={() => onNewAppointment()}
        units={units}
        selectedUnit={selectedUnit}
        onUnitChange={onUnitChange}
      />
      {/* Container do grid com agendamentos sobrepostos */}
      <div className="relative bg-white dark:bg-background rounded-lg border overflow-hidden">
        {/* Grid da agenda */}
        <ScheduleGrid
          weekDays={weekDays}
          hours={hours}
          renderCell={(day, hour) => {
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
            {(() => {
              // Separar bloqueios e agendamentos
              const blockedAppointments = weekSchedules.filter(
                (appointment) => appointment.isBlocked
              );
              const regularAppointments = weekSchedules.filter(
                (appointment) => !appointment.isBlocked
              );

              // Detectar conflitos para agendamentos regulares
              const blockInterval = config?.blockInterval || 30;
              const appointmentConflicts = detectTimeConflicts(
                regularAppointments,
                hours,
                weekDays,
                startOfGridWeek,
                blockInterval
              );
              const blockedConflicts = detectTimeConflicts(
                blockedAppointments,
                hours,
                weekDays,
                startOfGridWeek,
                blockInterval
              );

              // Ordenar cada categoria por horário (startTime)
              const sortByTime = (
                a: AttendanceSchedule,
                b: AttendanceSchedule
              ) => {
                const timeA = timeToMinutes(a.startTime || "00:00");
                const timeB = timeToMinutes(b.startTime || "00:00");
                return timeA - timeB;
              };

              const sortedBlocked = blockedAppointments.sort(sortByTime);
              const sortedRegular = regularAppointments.sort(sortByTime);

              // Renderizar bloqueios primeiro (z-index menor)
              const blockedElements = sortedBlocked.map(
                (appointment, index) => {
                  const position = calculateAppointmentPositionWithConflicts(
                    appointment,
                    hours,
                    weekDays,
                    startOfGridWeek,
                    blockInterval,
                    blockedConflicts
                  );

                  if (!position) return null;

                  const doctorName =
                    appointment.professional?.name || "Profissional";
                  const zIndex = 10 + index; // z-index baixo para bloqueios
                  const hasConflicts = position.widthPercentage < 100;

                  return (
                    <div
                      key={`blocked-${appointment.id}`}
                      className="absolute pointer-events-auto cursor-pointer border group rounded-md transition-all duration-300 ease-in-out hover:shadow-lg hover:z-50"
                      style={{
                        backgroundColor: themeColors.blocked,
                        borderColor: themeColors.blockedBorder,
                        color: themeColors.text,
                        left: `calc(100px + (100% - 100px) / ${weekDays.length} * ${position.dayIndex} + 4px + (((100% - 100px) / ${weekDays.length} - 8px) * ${position.offsetPercentage} / 100))`,
                        width: `calc(((100% - 100px) / ${weekDays.length} - 8px) * ${position.widthPercentage} / 100)`,
                        top: `${position.topPosition + 80}px`,
                        height: `${position.height}px`,
                        minHeight: "32px",
                        zIndex: hasConflicts ? 999 : zIndex,
                      }}
                      onClick={() => onEditAppointment(appointment)}
                      onMouseEnter={() => {
                        if (hasConflicts) {
                          const currentElement = document.querySelector(
                            `[key="blocked-${appointment.id}"]`
                          ) as HTMLElement;
                          const conflictGroup =
                            blockedConflicts[
                              `${position.dayIndex}-${Math.floor(
                                position.topPosition / 40
                              )}`
                            ];

                          if (currentElement && conflictGroup) {
                            // Expandir o elemento atual para 85% da largura
                            currentElement.style.width = `calc(((100% - 100px) / ${weekDays.length} - 8px) * 0.85)`;
                            currentElement.style.left = `calc(100px + (100% - 100px) / ${weekDays.length} * ${position.dayIndex} + 4px)`;
                            currentElement.style.zIndex = "1000";

                            // Reduzir os outros elementos para faixas de 20px
                            conflictGroup.forEach(
                              (conflictAppointment, idx) => {
                                if (conflictAppointment.id !== appointment.id) {
                                  const siblingElement = document.querySelector(
                                    `[key="blocked-${conflictAppointment.id}"]`
                                  ) as HTMLElement;
                                  if (siblingElement) {
                                    siblingElement.style.width = "20px";
                                    siblingElement.style.left = `calc(100px + (100% - 100px) / ${
                                      weekDays.length
                                    } * ${
                                      position.dayIndex
                                    } + 4px + ((100% - 100px) / ${
                                      weekDays.length
                                    } - 8px) * 0.85 + ${idx * 22}px)`;
                                    siblingElement.style.opacity = "0.7";
                                    siblingElement.style.zIndex = "999";
                                  }
                                }
                              }
                            );
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        if (hasConflicts) {
                          const conflictGroup =
                            blockedConflicts[
                              `${position.dayIndex}-${Math.floor(
                                position.topPosition / 40
                              )}`
                            ];
                          if (conflictGroup) {
                            // Restaurar todas as posições e larguras originais
                            conflictGroup.forEach(
                              (conflictAppointment, idx) => {
                                const element = document.querySelector(
                                  `[key="blocked-${conflictAppointment.id}"]`
                                ) as HTMLElement;
                                if (element) {
                                  const originalWidthPercentage =
                                    100 / conflictGroup.length;
                                  const originalOffsetPercentage =
                                    idx * originalWidthPercentage;
                                  element.style.width = `calc(((100% - 100px) / ${weekDays.length} - 8px) * ${originalWidthPercentage} / 100)`;
                                  element.style.left = `calc(100px + (100% - 100px) / ${weekDays.length} * ${position.dayIndex} + 4px + (((100% - 100px) / ${weekDays.length} - 8px) * ${originalOffsetPercentage} / 100))`;
                                  element.style.opacity = "";
                                  element.style.zIndex = "";
                                }
                              }
                            );
                          }
                        }
                      }}
                      data-slot-key={`blocked-${position.dayIndex}-${Math.floor(
                        position.topPosition / 40
                      )}`}
                    >
                      {/* Card normal com conteúdo expandido no hover */}
                      <div className="p-1.5 h-full flex flex-col justify-between group-hover:p-2 transition-all duration-300">
                        <div className="flex-1 min-h-0">
                          <div
                            className="text-xs font-bold leading-tight mb-1 truncate group-hover:whitespace-normal flex items-center gap-1 transition-all duration-300"
                            style={{ color: themeColors.text }}
                          >
                            <Lock className="h-3 w-3 group-hover:h-4 group-hover:w-4 flex-shrink-0 transition-all duration-300" />
                            {appointment.startTime.slice(0, 5)} -{" "}
                            {appointment.endTime.slice(0, 5)}
                          </div>
                          <div
                            className="text-xs font-bold leading-tight mb-1 truncate group-hover:whitespace-normal transition-all duration-300"
                            style={{ color: themeColors.textMuted }}
                          >
                            <span className="group-hover:font-medium">
                              Profissional:
                            </span>{" "}
                            {doctorName}
                          </div>
                          {appointment.observation && (
                            <div
                              className="text-xs font-bold leading-tight mb-1 truncate group-hover:whitespace-normal mt-1 transition-all duration-300"
                              style={{ color: themeColors.textMuted }}
                            >
                              <span className="group-hover:font-medium">
                                Observação:
                              </span>{" "}
                              {appointment.observation}
                            </div>
                          )}
                        </div>
                        <div className="text-xs font-bold leading-tight mb-1 flex-shrink-0 transition-all duration-300">
                          <span className="px-1.5 py-0.5 group-hover:px-2 group-hover:py-1 rounded-full bg-black/10 dark:bg-white/10 text-xs group-hover:text-sm font-medium transition-all duration-300">
                            Bloqueado
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              );

              // Renderizar agendamentos depois (z-index maior)
              const regularElements = sortedRegular.map(
                (appointment, index) => {
                  const position = calculateAppointmentPositionWithConflicts(
                    appointment,
                    hours,
                    weekDays,
                    startOfGridWeek,
                    blockInterval,
                    appointmentConflicts
                  );

                  if (!position) return null;

                  const patientName = appointment.patient?.name || "Paciente";
                  const isProtocol = appointment.attendanceType === "protocolo";
                  const zIndex = 50 + index; // z-index alto para agendamentos
                  const hasConflicts = position.widthPercentage < 100;

                  return (
                    <div
                      key={`appointment-${appointment.id}`}
                      className={`absolute pointer-events-auto cursor-pointer border group overflow-visible rounded-md transition-all duration-300 ease-in-out hover:shadow-lg hover:z-50 ${
                        hasConflicts ? "hover:!w-auto hover:min-w-[200px]" : ""
                      }`}
                      style={{
                        backgroundColor: isProtocol
                          ? isDarkMode
                            ? "rgba(34, 197, 94, 0.25)"
                            : "rgba(167, 243, 208, 0.9)"
                          : themeColors.appointment,
                        borderColor: isProtocol
                          ? isDarkMode
                            ? "rgba(34, 197, 94, 0.5)"
                            : "rgba(110, 231, 183, 1)"
                          : themeColors.appointmentBorder,
                        color: themeColors.text,
                        left: `calc(100px + (100% - 100px) / ${weekDays.length} * ${position.dayIndex} + 4px + (((100% - 100px) / ${weekDays.length} - 8px) * ${position.offsetPercentage} / 100))`,
                        width: `calc(((100% - 100px) / ${weekDays.length} - 8px) * ${position.widthPercentage} / 100)`,
                        top: `${position.topPosition + 80}px`,
                        height: `${position.height}px`,
                        minHeight: "32px",
                        zIndex: hasConflicts ? 999 : zIndex,
                      }}
                      onClick={() => onEditAppointment(appointment)}
                      onMouseEnter={() => {
                        if (hasConflicts) {
                          const currentElement = document.querySelector(
                            `[key="appointment-${appointment.id}"]`
                          ) as HTMLElement;
                          const conflictGroup =
                            appointmentConflicts[
                              `${position.dayIndex}-${Math.floor(
                                position.topPosition / 40
                              )}`
                            ];

                          if (currentElement && conflictGroup) {
                            // Expandir o elemento atual para 85% da largura
                            currentElement.style.width = `calc(((100% - 100px) / ${weekDays.length} - 8px) * 0.85)`;
                            currentElement.style.left = `calc(100px + (100% - 100px) / ${weekDays.length} * ${position.dayIndex} + 4px)`;
                            currentElement.style.zIndex = "1000";

                            // Reduzir os outros elementos para faixas de 20px
                            conflictGroup.forEach(
                              (conflictAppointment, idx) => {
                                if (conflictAppointment.id !== appointment.id) {
                                  const siblingElement = document.querySelector(
                                    `[key="appointment-${conflictAppointment.id}"]`
                                  ) as HTMLElement;
                                  if (siblingElement) {
                                    siblingElement.style.width = "20px";
                                    siblingElement.style.left = `calc(100px + (100% - 100px) / ${
                                      weekDays.length
                                    } * ${
                                      position.dayIndex
                                    } + 4px + ((100% - 100px) / ${
                                      weekDays.length
                                    } - 8px) * 0.85 + ${idx * 22}px)`;
                                    siblingElement.style.opacity = "0.7";
                                    siblingElement.style.zIndex = "999";
                                  }
                                }
                              }
                            );
                          }
                        }
                      }}
                      onMouseLeave={() => {
                        if (hasConflicts) {
                          const conflictGroup =
                            appointmentConflicts[
                              `${position.dayIndex}-${Math.floor(
                                position.topPosition / 40
                              )}`
                            ];
                          if (conflictGroup) {
                            // Restaurar todas as posições e larguras originais
                            conflictGroup.forEach(
                              (conflictAppointment, idx) => {
                                const element = document.querySelector(
                                  `[key="appointment-${conflictAppointment.id}"]`
                                ) as HTMLElement;
                                if (element) {
                                  const originalWidthPercentage =
                                    100 / conflictGroup.length;
                                  const originalOffsetPercentage =
                                    idx * originalWidthPercentage;
                                  element.style.width = `calc(((100% - 100px) / ${weekDays.length} - 8px) * ${originalWidthPercentage} / 100)`;
                                  element.style.left = `calc(100px + (100% - 100px) / ${weekDays.length} * ${position.dayIndex} + 4px + (((100% - 100px) / ${weekDays.length} - 8px) * ${originalOffsetPercentage} / 100))`;
                                  element.style.opacity = "";
                                  element.style.zIndex = "";
                                }
                              }
                            );
                          }
                        }
                      }}
                      data-slot-key={`appointment-${
                        position.dayIndex
                      }-${Math.floor(position.topPosition / 40)}`}
                    >
                      {/* Card normal com conteúdo expandido no hover */}
                      <div className="p-1.5 h-full flex flex-col justify-between group-hover:p-2 transition-all duration-300">
                        <div className="flex-1 min-h-0">
                          <div
                            className="text-xs font-bold leading-tight mb-1 truncate group-hover:whitespace-normal flex items-center gap-1 transition-all duration-300"
                            style={{ color: themeColors.text }}
                          >
                            {appointment.startTime.slice(0, 5)} -{" "}
                            {appointment.endTime.slice(0, 5)}
                          </div>
                          <div
                            className="text-xs font-bold leading-tight mb-1 truncate group-hover:whitespace-normal transition-all duration-300"
                            style={{ color: themeColors.textMuted }}
                          >
                            <span className="group-hover:font-medium">
                              Paciente:
                            </span>{" "}
                            {patientName}
                          </div>
                          {appointment.serviceSession?.name && (
                            <div
                              className="text-xs font-bold leading-tight mb-1 transition-all duration-300"
                              style={{ color: themeColors.textMuted }}
                            >
                              <span className="group-hover:font-medium">
                                Serviço:
                              </span>{" "}
                              {appointment.serviceSession.name}
                            </div>
                          )}
                          {appointment.observation && (
                            <div
                              className="text-xs font-bold leading-tight mb-1 transition-all duration-300"
                              style={{ color: themeColors.textMuted }}
                            >
                              <span className="group-hover:font-medium">
                                Observação:
                              </span>{" "}
                              {appointment.observation}
                            </div>
                          )}
                        </div>
                        {isProtocol && (
                          <div className="text-xs font-bold leading-tight mb-1 flex-shrink-0 transition-all duration-300">
                            <span className="px-1.5 py-0.5 group-hover:px-2 group-hover:py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-300 text-xs group-hover:text-sm font-medium transition-all duration-300">
                              Protocolo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              );

              // Retornar todos os elementos na ordem correta
              return [...blockedElements, ...regularElements];
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleView;
