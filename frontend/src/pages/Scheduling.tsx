import { useState, useEffect, useCallback } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { appointmentApi, userApi, type Appointment, type User } from '../lib/api';
import AppointmentEditor from "@/components/AppointmentEditor";
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
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthProfessionals, setHealthProfessionals] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const { toast } = useToast();
  const { config, hours } = useScheduleConfig();

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

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const start = format(
        startOfWeek(new Date(), { locale: ptBR }),
        "yyyy-MM-dd"
      );
      const end = format(
        endOfWeek(new Date(), { locale: ptBR }),
        "yyyy-MM-dd"
      );
      const appointmentsList = await appointmentApi.list({
        startDate: start,
        endDate: end,
      });
      console.log("Agendamentos carregados:", appointmentsList);
      setAppointments(appointmentsList);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadHealthProfessionals();
    loadAllUsers();
    loadAppointments();
  }, [loadHealthProfessionals, loadAllUsers, loadAppointments]);

  useEffect(() => {
    loadAppointments();
  }, [selectedDoctors, loadAppointments]);

  const handleNewAppointment = () => {
    if (selectedDoctors.length === 0) {
      toast({
        title: "Atenção",
        description:
          "Por favor, selecione um médico para criar um agendamento.",
        variant: "default",
      });
      return;
    }
    setEditingAppointment(null);
    setIsEditorOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
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
      loadAppointments();
    } catch (error) {
      console.error("Error saving appointment:", error);
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
      loadAppointments();
    } catch (error) {
      console.error("Error canceling appointment:", error);
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
      loadAppointments();
    } catch (error) {
      console.error("Error confirming appointment:", error);
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
      loadAppointments();
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o agendamento como concluído.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateWeek = (direction: "next" | "prev") => {
    setWeekOffset(w => w + (direction === "next" ? 1 : -1));
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
    const start = new Date(startOfGridWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + weekDays.length - 1);
    return `${format(start, 'd MMM', { locale: ptBR })} - ${format(end, 'd MMM yyyy', { locale: ptBR })}`;
  }

  const getAppointmentsForSlot = (
    day: Date,
    time: string,
    doctorId: string
  ) => {
    const formattedDay = format(day, "yyyy-MM-dd");
    return appointments
      .filter(
        (appt) =>
          format(parseISO(appt.date), "yyyy-MM-dd") === formattedDay &&
          appt.startTime.substring(0, 5) === time &&
          appt.doctorId === doctorId &&
          selectedDoctors.includes(appt.doctorId)
      )
      .sort((a, b) => {
        const aStart =
          parseInt(a.startTime.split(":")[0]) * 60 +
          parseInt(a.startTime.split(":")[1]);
        const bStart =
          parseInt(b.startTime.split(":")[0]) * 60 +
          parseInt(b.startTime.split(":")[1]);
        return aStart - bStart;
      });
  };

  // Funções auxiliares melhoradas
  const getAppointmentsForDay = (day: Date) => {
    const formattedDay = format(day, "yyyy-MM-dd");
    return (appointments || []).filter((appt) => {
      const apptDate = format(parseISO(appt.date), "yyyy-MM-dd");
      return (
        apptDate === formattedDay && selectedDoctors.includes(appt.doctorId)
      );
    });
  };

  const getAppointmentPosition = (
    appointment: Appointment,
    slotStart: string
  ) => {
    const [apptHour, apptMinute] = appointment.startTime.split(":").map(Number);
    const [slotHour, slotMinute] = slotStart.split(":").map(Number);

    const apptMinutes = apptHour * 60 + apptMinute;
    const slotMinutes = slotHour * 60 + slotMinute;

    return {
      offsetMinutes: apptMinutes - slotMinutes,
      isInSlot: apptMinutes >= slotMinutes && apptMinutes < slotMinutes + 60,
    };
  };

  return (
    <ScrollArea className="h-[calc(100vh-64px)] w-full">
      <div className="flex flex-col h-full bg-background">
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 bg-card shadow-sm border-b">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Agenda</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                Calendário
              </Button>
              <Button variant="ghost" size="sm">
                Fila de espera
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atendimento"
                className="pl-8 w-[200px]"
              />
            </div>
            {/* Doctors Selection */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full h-9 w-9 p-0 relative"
                >
                  <span className="sr-only">Selecionar Médicos</span>
                  {healthProfessionals.length > 0 ? (
                    <img
                      src={
                        healthProfessionals[0].photo ||
                        `https://ui-avatars.com/api/?name=${healthProfessionals[0].name.replace(
                          /\s/g,
                          "+"
                        )}`
                      }
                      alt={healthProfessionals[0].name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <Settings className="h-5 w-5" />
                  )}
                  {selectedDoctors.length > 0 &&
                    selectedDoctors.length < healthProfessionals.length && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {selectedDoctors.length}
                      </span>
                    )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0">
                <div className="p-4">
                  <h4 className="font-medium text-sm mb-2">
                    Filtrar por Profissional
                  </h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="select-all-doctors"
                      checked={
                        selectedDoctors.length === healthProfessionals.length &&
                        healthProfessionals.length > 0
                      }
                      onCheckedChange={handleSelectAllDoctors}
                    />
                    <Label htmlFor="select-all-doctors">
                      Todos os Profissionais
                    </Label>
                  </div>
                  <Separator className="my-2" />
                  <ScrollArea className="h-40">
                    {healthProfessionals.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <Checkbox
                          id={`doctor-${doctor.id}`}
                          checked={selectedDoctors.includes(doctor.id)}
                          onCheckedChange={() =>
                            handleDoctorSelection(doctor.id)
                          }
                        />
                        <Label
                          htmlFor={`doctor-${doctor.id}`}
                          className="flex items-center"
                        >
                          {doctor.photo ? (
                            <img
                              src={doctor.photo}
                              alt={doctor.name}
                              className="h-6 w-6 rounded-full object-cover mr-2"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                              <span className="text-primary text-xs font-medium">
                                {doctor.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          {doctor.name}
                        </Label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={handleNewAppointment}>
              <Plus className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-t">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{getWeekLabel()}</span>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
              Hoje
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="font-bold">
              Semana
            </Button>
          </div>
        </div>

        {/* Main Scheduling Grid */}
        <div className="flex-1 overflow-auto bg-background">
          <ScheduleGrid
            weekDays={weekDays}
            hours={hours}
            weekOffset={weekOffset}
            // Você pode passar renderCell, onCellClick, etc, conforme necessidade
          />
        </div>

        {isEditorOpen && editingAppointment && (
          <AppointmentEditor
            appointment={editingAppointment}
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveAppointment}
            doctors={healthProfessionals}
            allUsers={allUsers}
            patientId={editingAppointment.patientId}
          />
        )}

        {isEditorOpen && !editingAppointment && (
          <AppointmentEditor
            appointment={null}
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveAppointment}
            doctors={healthProfessionals}
            allUsers={allUsers}
            patientId=""
          />
        )}
      </div>
    </ScrollArea>
  );
}
