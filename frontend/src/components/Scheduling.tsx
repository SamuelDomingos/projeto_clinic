import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Plus, CalendarDays, ChevronLeft, ChevronRight, Edit, Eye, MoreVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import AppointmentEditor from "./AppointmentEditor/AppointmentEditor";
import type { Appointment as GlobalAppointment } from '@/lib/api/types/appointment';
import type { User } from '@/lib/api/types/common';
import { userApi } from "../lib/api";
import { attendanceScheduleApi } from "../lib/api/services/attendanceSchedule";
import type { AttendanceSchedule, CreateAttendanceScheduleData } from "@/lib/api/types/attendanceSchedule";

// Status válidos para o tipo global
const VALID_STATUSES = ["scheduled", "confirmed", "completed", "cancelled"] as const;
type ValidStatus = typeof VALID_STATUSES[number];

// Tipo explícito para o mock de agendamento
interface AppointmentMock {
  id: string;
  time: string;
  duration: number;
  patient: string;
  procedure: string;
  status: string;
  date: string;
  notes?: string;
}

// Função para garantir contraste do texto
function getContrastYIQ(hexcolor: string) {
  hexcolor = hexcolor.replace('#', '');
  if (hexcolor.length !== 6) return '#222';
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return yiq >= 128 ? '#222' : '#fff';
}
// Função para gerar cor de fundo translúcida baseada na cor escolhida
function getPreviewBg(hex: string, dark = false) {
  if (!hex) return dark ? '#16232b' : '#f3fbfd';
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0,2), 16);
  const g = parseInt(h.substring(2,4), 16);
  const b = parseInt(h.substring(4,6), 16);
  return dark
    ? `rgba(${r},${g},${b},0.18)`
    : `rgba(${r},${g},${b},0.12)`;
}

// Tipo extendido para agendamento com campos extras opcionais

type AttendanceScheduleWithExtras = AttendanceSchedule & {
  procedure?: string;
  duration?: number;
  status?: string;
};

type SchedulingAppointment = (Partial<AttendanceSchedule> & Partial<GlobalAppointment>) & { status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'; id: string };

export function Scheduling() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");
  const [editingAppointment, setEditingAppointment] = useState<SchedulingAppointment | null>(null);
  const [editingDoctor, setEditingDoctor] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Record<string, Record<string, AttendanceScheduleWithExtras>>>({});
  const [loading, setLoading] = useState(false);

  // Defina os horários conforme o padrão da empresa
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  // Busca profissionais de saúde
  useEffect(() => {
    userApi.list({ role: "health_professional" }).then(setDoctors);
  }, []);

  // Função para obter o início e fim da semana
  function getWeekRange(date: Date) {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  }

  // Busca agendamentos da API
  useEffect(() => {
    if (doctors.length === 0) return;
    setLoading(true);
    const { startDate, endDate } = getWeekRange(currentDate);
    attendanceScheduleApi.list({ startDate, endDate })
      .then(data => {
        // Organiza por médico e horário
        const grouped: Record<string, Record<string, AttendanceScheduleWithExtras>> = {};
        data.forEach(item => {
          if (!grouped[item.userId]) grouped[item.userId] = {};
          grouped[item.userId][item.startTime] = item as AttendanceScheduleWithExtras;
        });
        setAppointments(grouped);
      })
      .finally(() => setLoading(false));
  }, [currentDate, doctors]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleEditAppointment = (doctor: string, time: string) => {
    const appointment = appointments[doctor]?.[time];
    if (appointment) {
      setEditingAppointment({
        ...appointment,
        status: (['scheduled', 'confirmed', 'completed', 'cancelled'].includes(appointment.status) ? appointment.status : 'scheduled') as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
        id: appointment.id || '',
        patientId: appointment.patientId || '',
        patient: appointment.patient
          ? {
              id: appointment.patient.id,
              name: appointment.patient.name,
              email: appointment.patient.email || '',
              phone: appointment.patient.phone || '',
            }
          : { id: '', name: '', email: '', phone: '' },
      });
      setEditingDoctor(doctor);
      setIsEditorOpen(true);
    }
  };


  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const sourceDoctor = source.droppableId.split('-')[0];
    const sourceTime = source.droppableId.split('-')[1];
    const destDoctor = destination.droppableId.split('-')[0];
    const destTime = destination.droppableId.split('-')[1];

    if (sourceDoctor === destDoctor && sourceTime === destTime) return;

    setAppointments(prev => {
      const newAppointments = { ...prev };
      
      // Remove do local original
      const appointment = newAppointments[sourceDoctor][sourceTime];
      delete newAppointments[sourceDoctor][sourceTime];
      
      // Adiciona no novo local
      if (!newAppointments[destDoctor]) {
        newAppointments[destDoctor] = {};
      }
      
      newAppointments[destDoctor][destTime] = {
        ...appointment,
        startTime: destTime
      };
      
      return newAppointments;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-4 bg-background">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Agendamentos</h2>
          <p className="text-sm text-muted-foreground">Gestão de consultas e procedimentos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
            <Button 
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              onClick={() => setViewMode('day')}
              size="sm"
              className={viewMode === 'day' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}
            >
              Dia
            </Button>
            <Button 
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              onClick={() => setViewMode('week')}
              size="sm"
              className={viewMode === 'week' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}
            >
              Semana
            </Button>
            <Button 
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              onClick={() => setViewMode('month')}
              size="sm"
              className={viewMode === 'month' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}
            >
              Mês
            </Button>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')} className="hover:bg-background/50">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium text-foreground min-w-[200px] text-center">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')} className="hover:bg-background/50">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="border-border text-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          Hoje
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4" />
            <span>Calendário Semanal</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Lista</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Grade de Horários</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="overflow-x-auto -mx-6 px-6">
                  <div className="min-w-[800px]">
                    {/* Header da tabela */}
                    <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-0.5">
                      <div className="font-medium text-sm text-muted-foreground p-1.5 text-center bg-muted border border-border rounded">Horário</div>
                      {doctors.map((doctor) => (
                        <div 
                          key={doctor.id} 
                          className={`${doctor.status === 'active' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted'} p-1.5 text-center border border-border rounded`}
                        >
                          <p className="font-medium text-xs text-foreground truncate">{doctor.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{doctor.role}</p>
                        </div>
                      ))}
                    </div>

                    {/* Grid de horários */}
                    <div className="mt-1 space-y-0.5">
                      {timeSlots.map((timeSlot) => (
                        <div key={timeSlot} className="grid grid-cols-[80px_1fr_1fr_1fr] gap-0.5">
                          {/* Coluna de horário */}
                          <div className="flex items-center justify-center p-1.5 bg-muted border border-border text-xs font-medium text-foreground rounded">
                            {timeSlot}
                          </div>
                          
                          {/* Colunas dos médicos */}
                          {doctors.map((doctor) => (
                            <Droppable key={`${doctor.id}-${timeSlot}`} droppableId={`${doctor.id}-${timeSlot}`}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`min-h-[50px] p-1 border-2 border-dashed rounded transition-colors ${
                                    snapshot.isDraggingOver 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border bg-background hover:bg-muted/50'
                                  }`}
                                >
                                  {appointments[doctor.id]?.[timeSlot] ? (
                                    <Draggable 
                                      draggableId={appointments[doctor.id][timeSlot].id} 
                                      index={0}
                                    >
                                      {(provided, snapshot) => {
                                        const color = doctor.status === 'active' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted';
                                        const appt = appointments[doctor.id][timeSlot];
                                        return (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="p-0 rounded border cursor-move transition-shadow bg-transparent"
                                          >
                                            <div
                                              className="rounded-lg px-2 py-1 flex items-center gap-2"
                                              style={{
                                                background: getPreviewBg(color, false),
                                                border: `1.5px solid ${color}`,
                                                minHeight: 40,
                                                transition: 'background 0.2s, border 0.2s',
                                              }}
                                            >
                                              <span
                                                className="inline-block w-3 h-3 rounded-full"
                                                style={{ background: color }}
                                              />
                                              <div>
                                                <div className="text-xs font-semibold" style={{ color: getContrastYIQ(color) }}>
                                                  {appt.procedure ?? ''}
                                                </div>
                                                <div className="text-[11px] opacity-70" style={{ color: getContrastYIQ(color) }}>
                                                  {appt.startTime} - {typeof appt.patient === 'object' ? appt.patient.name : appt.patientId}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }}
                                    </Draggable>
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-[10px]">
                                      Clique duas vezes para agendar
                                    </div>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DragDropContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-card-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Todos os Agendamentos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Data/Hora</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Paciente</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Médico</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Procedimento</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Duração</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(appointments).map(([doctorId, timeSlots]) =>
                      Object.entries(timeSlots).map(([time, appointment]) => (
                        <tr key={appointment.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-foreground">
                                {new Date(appointment.date).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-sm text-muted-foreground">{appointment.startTime}</p>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-foreground">{typeof appointment.patient === 'object' ? appointment.patient.name : appointment.patientId}</td>
                          <td className="p-4 text-muted-foreground">{doctors.find(d => d.id === doctorId)?.name}</td>
                          <td className="p-4 text-muted-foreground">{appointment.procedure ?? ''}</td>
                          <td className="p-4 text-muted-foreground">{appointment.duration ?? ''}min</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(appointment.status ?? '')} variant="outline">
                              {getStatusLabel(appointment.status ?? '')}
                            </Badge>
                          </td>
                          <td className="p-4 space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAppointment(doctorId, time)}
                              className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AppointmentEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}
