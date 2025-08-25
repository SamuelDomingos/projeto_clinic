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
import {
  appointmentApi,
  userApi,
  type Appointment,
  type User,
  attendanceScheduleApi,
} from "../lib/api";
import type { AttendanceSchedule } from "../lib/api/types/attendanceSchedule";
import AppointmentEditor from "@/components/AppointmentEditor/AppointmentEditor";
import AppointmentEditorCard from "@/components/AppointmentEditor/AppointmentEditorCard";
import { Badge } from "@/components/ui/badge";
import { useScheduleConfig } from "@/contexts/ScheduleConfigContext";
import ScheduleView from "@/components/Scheduling/ScheduleView";
import { SchedulingHeader } from "@/components/Scheduling";

export default function Scheduling() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingAppointment, setEditingAppointment] =
    useState<AttendanceSchedule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewAppointment, setIsNewAppointment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<AttendanceSchedule[]>([]);
  const [healthProfessionals, setHealthProfessionals] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]); // ADICIONAR ESTA LINHA
  const { toast } = useToast();
  const { config, hours, loading: loadingConfig } = useScheduleConfig();

  // Selecionar automaticamente o primeiro profissional quando a lista for carregada
  useEffect(() => {
    if (healthProfessionals.length > 0 && selectedDoctors.length === 0) {
      setSelectedDoctors([healthProfessionals[0].id]);
    }
  }, [healthProfessionals, selectedDoctors.length]); // Adicionar as dependências

  const loadHealthProfessionals = useCallback(async () => {
    try {
      const response = await userApi.list();
      const professionals = (response as User[]).filter((user) => {
        return user.role === "health_professional" && user.status === "active";
      });
      setHealthProfessionals(professionals);

      if (professionals.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum profissional de saúde ativo encontrado",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais",
        variant: "destructive",
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
        variant: "destructive",
      });
    }
  }, [toast]);

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
      });

      setSchedules(schedulesList);
    } catch (error) {
      console.error("Erro ao carregar schedules:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentDate, toast]); // Remover selectedDoctors das dependências

  useEffect(() => {
    loadHealthProfessionals();
    loadAllUsers();
    loadSchedules();
  }, [loadHealthProfessionals, loadAllUsers, loadSchedules]);

  useEffect(() => {
    loadSchedules();
  }, [selectedDoctors, loadSchedules]);

  // Remover as importações incorretas das linhas 121-122
  // e adicionar o estado isNewAppointment

  const handleNewAppointment = (date?: string, startTime?: string) => {
    setEditingAppointment({
      id: "",
      patientId: "",
      userId: selectedDoctors[0] || "",
      unitId: "",
      date: date || new Date().toISOString().split("T")[0],
      startTime: startTime || "",
      endTime: "",
      attendanceType: "avulso",
      value: null,
      isBlocked: false,
      createdAt: "",
      updatedAt: "",
    });
    setIsNewAppointment(true); // Marcar como novo agendamento
    setIsEditorOpen(true);
  };

  const handleEditAppointment = (appt: AttendanceSchedule) => {
    setEditingAppointment(appt);
    setIsNewAppointment(false); // Marcar como edição
    setIsEditorOpen(true);
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

  const handleWeekChange = (newOffset: number) => {
    setWeekOffset(newOffset);
    const direction = newOffset > weekOffset ? 1 : -1;
    setCurrentDate((prev) =>
      direction > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  // Calcular os dias da semana baseados no contexto
  const weekDays = config?.workingDays || [
    "Segunda-Feira",
    "Terça-Feira",
    "Quarta-Feira",
    "Quinta-Feira",
    "Sexta-Feira",
    "Sábado",
    "Domingo",
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-1">Agenda</h1>
      
      {/* Integração com o componente Scheduling */}
      <SchedulingHeader
        selectedDoctors={selectedDoctors}
        doctors={healthProfessionals}
      />
      {loadingConfig ? (
        <div className="flex items-center justify-center h-64">
          Carregando...
        </div>
      ) : (
        <ScheduleView
          weekDays={weekDays}
          hours={hours}
          schedules={schedules}
          healthProfessionals={healthProfessionals}
          selectedDoctors={selectedDoctors}
          weekOffset={weekOffset}
          onNewAppointment={handleNewAppointment}
          onEditAppointment={handleEditAppointment}
          onWeekChange={handleWeekChange}
        />
      )}

      {/* Editor de agendamentos - usar AppointmentEditor para NOVOS agendamentos */}
      {isEditorOpen && editingAppointment && isNewAppointment && (
        <AppointmentEditor
          appointment={{
            id: editingAppointment.id,
            patientId: editingAppointment.patientId,
            doctorId: editingAppointment.userId,
            date: editingAppointment.date,
            startTime: editingAppointment.startTime,
            endTime: editingAppointment.endTime,
            duration: 30,
            procedure: "",
            status: "scheduled",
            notes: editingAppointment.observation || "",
            patient: editingAppointment.patient
              ? {
                  id: editingAppointment.patient.id,
                  name: editingAppointment.patient.name,
                  email: editingAppointment.patient.email || "",
                  phone: editingAppointment.patient.phone || "",
                }
              : {
                  id: "",
                  name: "",
                  email: "",
                  phone: "",
                },
            doctor: undefined,
            createdAt: editingAppointment.createdAt,
            updatedAt: editingAppointment.updatedAt,
            unit: editingAppointment.unit,
            attendanceType: editingAppointment.attendanceType,
            patientProtocol: editingAppointment.protocol,
            serviceSession: editingAppointment.serviceSession,
            isBlocked: editingAppointment.isBlocked,
          }}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setIsNewAppointment(false);
            // Recarregar a agenda após fechar o editor
            loadSchedules();
          }}
          onSave={async (appt) => {
            const data = {
              ...editingAppointment,
              professionalId: appt.doctorId,
              patientId: appt.patientId,
              date: appt.date,
              startTime: appt.startTime,
              endTime: appt.endTime,
              observation: appt.notes,
            };
            if (editingAppointment.id) {
              await attendanceScheduleApi.update(editingAppointment.id, data);
            } else {
              await attendanceScheduleApi.create(data);
            }
            setIsEditorOpen(false);
            setIsNewAppointment(false);
            // Recarregar a agenda após salvar
            loadSchedules();
          }}
          doctors={healthProfessionals}
          allUsers={allUsers}
          patientId={editingAppointment.patientId}
        />
      )}

      {/* AppointmentEditorCard para EDITAR agendamentos existentes (clique nos cards) */}
      {isEditorOpen && editingAppointment && !isNewAppointment && (
        <AppointmentEditorCard
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setIsNewAppointment(false);
            // Recarregar a agenda após fechar o editor
            loadSchedules();
          }}
          appointment={editingAppointment}
          onSave={async (appt) => {
            const data = {
              ...editingAppointment,
              professionalId: appt.doctorId,
              patientId: appt.patientId,
              date: appt.date,
              startTime: appt.startTime,
              endTime: appt.endTime,
              observation: appt.notes,
            };
            if (editingAppointment.id) {
              await attendanceScheduleApi.update(editingAppointment.id, data);
            } else {
              await attendanceScheduleApi.create(data);
            }
            setIsEditorOpen(false);
            setIsNewAppointment(false);
            // Recarregar a agenda após salvar
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
