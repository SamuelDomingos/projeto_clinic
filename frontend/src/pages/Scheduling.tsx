import { useState, useEffect, useCallback } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  parseISO,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { appointmentApi, userApi, type Appointment, type User, attendanceScheduleApi } from '../lib/api';
import type { AttendanceSchedule } from '../lib/api/types/attendanceSchedule';
import AppointmentEditor from "@/components/AppointmentEditor/AppointmentEditor";
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import ScheduleGrid from '@/components/ui/ScheduleGrid';
import { useScheduleConfig } from '@/contexts/ScheduleConfigContext';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

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

export default function Scheduling() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingAppointment, setEditingAppointment] = useState<AttendanceSchedule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<AttendanceSchedule[]>([]);
  const [healthProfessionals, setHealthProfessionals] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const { toast } = useToast();
  const { config, hours, loading: loadingConfig } = useScheduleConfig();
  const navigate = useNavigate();

  const loadHealthProfessionals = useCallback(async () => {
    try {
      const response = await userApi.list();
      const professionals = (response as User[]).filter(user => 
        user.permissions.includes('appointments') && user.status === 'active'
      );
      setHealthProfessionals(professionals);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais",
        variant: "destructive"
      });
    }
  }, [toast]);

  const loadAllUsers = useCallback(async () => {
    try {
      const response = await userApi.list();
      setAllUsers(response as User[]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Substituir loadAppointments por loadSchedules
  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const start = format(
        startOfWeek(currentDate, { locale: ptBR }),
        "yyyy-MM-dd"
      );
      const end = format(
        endOfWeek(currentDate, { locale: ptBR }),
        "yyyy-MM-dd"
      );
      const schedulesList = await attendanceScheduleApi.list({
        startDate: start,
        endDate: end,
        userId: selectedDoctors.length === 1 ? selectedDoctors[0] : undefined,
      });
      setSchedules(schedulesList);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentDate, selectedDoctors, toast]);

  useEffect(() => {
    loadHealthProfessionals();
    loadAllUsers();
    loadSchedules();
  }, [loadHealthProfessionals, loadAllUsers, loadSchedules]);

  useEffect(() => {
    loadSchedules();
  }, [selectedDoctors, loadSchedules]);

  const handleNewAppointment = (date?: string, startTime?: string) => {
    setEditingAppointment({
      id: '',
      patientId: '',
      userId: selectedDoctors[0] || '',
      unitId: '',
      date: date || new Date().toISOString().split('T')[0],
      startTime: startTime || '',
      endTime: '',
      attendanceType: 'avulso',
      value: null,
      isBlocked: false,
      createdAt: '',
      updatedAt: '',
    } as AttendanceSchedule);
    setIsEditorOpen(true);
  };

  const handleEditAppointment = (appt: AttendanceSchedule) => {
    setEditingAppointment(appt);
    setIsEditorOpen(true);
  };

  const handleSaveAppointment = async (appointment: Appointment) => {
    try {
      if (editingAppointment) {
        await appointmentApi.update(editingAppointment.id, appointment);
        toast({
          title: "Sucesso",
          description: "Agendamento atualizado com sucesso.",
        });
      } else {
        const newAppointmentData = {
          ...appointment,
          doctorId: selectedDoctors[0],
        };
        await appointmentApi.create(newAppointmentData);
        toast({
          title: "Sucesso",
          description: "Agendamento criado com sucesso.",
        });
      }
      setIsEditorOpen(false);
      loadSchedules();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      await appointmentApi.cancel(appointment.id);
      toast({
        title: "Sucesso",
        description: "Agendamento cancelado com sucesso.",
      });
      loadSchedules();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmAppointment = async (appointment: Appointment) => {
    try {
      await appointmentApi.confirm(appointment.id);
      toast({
        title: "Sucesso",
        description: "Agendamento confirmado com sucesso.",
      });
      loadSchedules();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    try {
      await appointmentApi.complete(appointment.id);
      toast({
        title: "Sucesso",
        description: "Agendamento marcado como concluído.",
      });
      loadSchedules();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar o agendamento como concluído.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateWeek = (direction: "next" | "prev") => {
    setWeekOffset(w => w + (direction === "next" ? 1 : -1));
    setCurrentDate(
      direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "completed":
        return "Concluído";
      case "scheduled":
        return "Agendado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const handleDoctorSelection = (id: string) => {
    setSelectedDoctors((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const handleSelectAllDoctors = () => {
    if (selectedDoctors.length === healthProfessionals.length) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(healthProfessionals.map((d) => d.id));
    }
  };

  // Calcular os dias da semana baseados no contexto e offset
  const weekDays = config?.workingDays || [
    'Segunda-Feira',
    'Terça-Feira',
    'Quarta-Feira',
    'Quinta-Feira',
    'Sexta-Feira',
    'Sábado',
    'Domingo',
  ];
  const firstDayIndex = dayNameToIndex[weekDays[0]] ?? 1;
  const startOfGridWeek = getStartOfWeek(firstDayIndex, weekOffset);

  function getWeekLabel() {
    if (!weekDays.length) return '';
    const firstDayIndex = dayNameToIndex[weekDays[0]] ?? 1;
    const start = getStartOfWeek(firstDayIndex, weekOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + weekDays.length - 1);
    const options = { day: '2-digit', month: 'short' } as const;
    return `${start.getDate()} – ${end.getDate()} de ${end.toLocaleDateString('pt-BR', { month: 'short' })}`;
  }
  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(currentDate, { locale: ptBR }), i)
  );
  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return format(new Date().setHours(hour, minute, 0, 0), "HH:mm");
  });

  const getAppointmentsForSlot = (
    day: Date,
    time: string,
    doctorId: string
  ) => {
    const formattedDay = format(day, "yyyy-MM-dd");
    return schedules
      .filter(
        (appt) =>
          appt.date === formattedDay &&
          appt.blockedStartTime &&
          appt.blockedEndTime &&
          appt.blockedStartTime <= time &&
          appt.blockedEndTime > time &&
          appt.userId === doctorId &&
          selectedDoctors.includes(appt.userId)
      )
      .sort((a, b) => {
        const aStart =
          parseInt(a.blockedStartTime.split(":")[0]) * 60 +
          parseInt(a.blockedStartTime.split(":")[1]);
        const bStart =
          parseInt(b.blockedStartTime.split(":")[0]) * 60 +
          parseInt(b.blockedStartTime.split(":")[1]);
        return aStart - bStart;
      });
  };

  // Funções auxiliares melhoradas
  const getSchedulesForDay = (day: Date) => {
    const formattedDay = format(day, "yyyy-MM-dd");
    return (schedules || []).filter((item) => {
      const itemDate = item.date;
      return (
        itemDate === formattedDay &&
        selectedDoctors.includes(item.userId) &&
        !item.isBlocked
      );
    });
  };

  const getBlockedForSlot = (day: Date, time: string, doctorId: string) => {
    const formattedDay = format(day, "yyyy-MM-dd");
    return schedules.filter(
      (item) =>
        item.isBlocked &&
        item.userId === doctorId &&
        item.date === formattedDay &&
        item.blockedStartTime &&
        item.blockedEndTime &&
        item.blockedStartTime <= time &&
        item.blockedEndTime > time
    );
  };

  const getAppointmentPosition = (
    appointment: AttendanceSchedule,
    slotStart: string
  ) => {
    const [apptHour, apptMinute] = appointment.blockedStartTime.split(":").map(Number);
    const [slotHour, slotMinute] = slotStart.split(":").map(Number);

    const apptMinutes = apptHour * 60 + apptMinute;
    const slotMinutes = slotHour * 60 + slotMinute;

    return {
      offsetMinutes: apptMinutes - slotMinutes,
      isInSlot: apptMinutes >= slotMinutes && apptMinutes < slotMinutes + 60,
    };
  };

  // Função utilitária para obter a data exata a partir do nome do dia e semana corrente
  function getDateFromDayName(dayName: string, weekDays: string[], startOfGridWeek: Date) {
    const idx = weekDays.indexOf(dayName);
    const date = new Date(startOfGridWeek);
    date.setDate(startOfGridWeek.getDate() + idx);
    return date;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-1">Agenda</h1>
      <div className="text-gray-500 mb-6">Gerencie os agendamentos e bloqueios dos profissionais de saúde.</div>
      <div className="bg-white dark:bg-background rounded shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
            <span className="font-semibold text-lg">Profissionais</span>
            {/* Aqui pode ir um select de unidade ou profissional */}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => handleNewAppointment()}>
              <Plus className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </div>
        </div>
        {/* Barra de navegação da semana */}
        <div className="flex items-center gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}>{'<'}</Button>
          <span className="font-semibold">{getWeekLabel()}</span>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}>{'>'}</Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
          {/* Legenda */}
          <div className="flex items-center gap-4 ml-8">
            <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-blue-100 border border-blue-200"></span> Agendamento</span>
            <span className="flex items-center gap-1"><span className="inline-block w-4 h-4 rounded bg-gray-300 border border-gray-400"></span> Bloqueado</span>
          </div>
        </div>
        {/* Grade de horários (ScheduleGrid) */}
        {loadingConfig ? (
          <div className="flex items-center justify-center h-64">Carregando...</div>
        ) : (
          <ScheduleGrid
            weekDays={weekDays}
            hours={hours}
            renderCell={(day, hour) => {
              const dateObj = getDateFromDayName(day, weekDays, startOfGridWeek);
              const bloqueios = getBlockedForSlot(dateObj, hour, selectedDoctors[0] || '');
              if (bloqueios.length > 0) {
                return <div className="absolute inset-0 bg-gray-300 opacity-60 flex items-center justify-center z-20 rounded"><span className="text-xs font-bold text-gray-700">Bloqueado</span></div>;
              }
              const agendamentos = getSchedulesForDay(dateObj).filter(a => a.startTime === hour);
              if (agendamentos.length > 0) {
                return agendamentos.map(a => (
                  <div key={a.id} className="bg-blue-100 text-blue-800 border-blue-200 rounded p-1 mb-1 text-xs cursor-pointer" onClick={() => handleEditAppointment(a)}>
                    {a.patient?.name || 'Paciente'}<br/>
                    <span className="opacity-70">{a.attendanceType === 'protocolo' ? 'Protocolo' : 'Avulso'}</span>
                  </div>
                ));
              }
              return null;
            }}
            onCellClick={(day, hour) => {
              if (selectedDoctors.length > 0) {
                handleNewAppointment();
              }
            }}
            weekOffset={weekOffset}
          />
        )}
      </div>
      {isEditorOpen && editingAppointment && (
        <AppointmentEditor
          appointment={{
            id: editingAppointment.id,
            patientId: editingAppointment.patientId,
            doctorId: editingAppointment.userId,
            date: editingAppointment.date,
            startTime: editingAppointment.startTime,
            duration: 30,
            procedure: '',
            status: 'scheduled',
            notes: editingAppointment.observation || '',
            patient: editingAppointment.patient ? {
              id: editingAppointment.patient.id,
              name: editingAppointment.patient.name,
              email: editingAppointment.patient.email || '',
              phone: editingAppointment.patient.phone || '',
            } : {
              id: '',
              name: '',
              email: '',
              phone: '',
            },
            doctor: undefined,
            createdAt: editingAppointment.createdAt,
            updatedAt: editingAppointment.updatedAt,
          }}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={async (appt) => {
            const data = {
              ...editingAppointment,
              userId: appt.doctorId,
              patientId: appt.patientId,
              date: appt.date,
              startTime: appt.startTime,
              endTime: appt.endTime,
              observation: appt.notes,
              // outros campos...
            };
            if (editingAppointment.id) {
              await attendanceScheduleApi.update(editingAppointment.id, data);
            } else {
              await attendanceScheduleApi.create(data);
            }
            setIsEditorOpen(false);
            loadSchedules();
          }}
          doctors={healthProfessionals}
          allUsers={allUsers}
          patientId={editingAppointment.patientId}
        />
      )}
    </div>
  );
}
