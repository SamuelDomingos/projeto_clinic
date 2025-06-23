import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Plus, CalendarDays, ChevronLeft, ChevronRight, Edit, Eye, MoreVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { AppointmentEditor } from "./AppointmentEditor";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Appointment {
  id: string;
  time: string;
  duration: number;
  patient: string;
  procedure: string;
  status: string;
  date: string;
  notes?: string;
}

export function Scheduling() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingDoctor, setEditingDoctor] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Dados mockados para agendamentos organizados por horário e médico
  const [appointments, setAppointments] = useState({
    "Dr. João Silva": {
      "09:00": {
        id: "1",
        time: "09:00",
        duration: 60,
        patient: "Maria Silva",
        procedure: "Consulta Dermatológica",
        status: "confirmed",
        date: "2024-06-05",
        notes: "Paciente com histórico de alergias"
      },
      "10:30": {
        id: "2",
        time: "10:30",
        duration: 45,
        patient: "João Santos",
        procedure: "Aplicação Botox",
        status: "completed",
        date: "2024-06-05"
      }
    },
    "Dra. Ana Costa": {
      "14:00": {
        id: "3",
        time: "14:00",
        duration: 30,
        patient: "Ana Costa",
        procedure: "Limpeza de Pele",
        status: "pending",
        date: "2024-06-05"
      }
    },
    "Dra. Maria Santos": {
      "15:30": {
        id: "4",
        time: "15:30",
        duration: 60,
        patient: "Carlos Oliveira",
        procedure: "Consulta Geral",
        status: "confirmed",
        date: "2024-06-06"
      }
    }
  });

  const doctors = [
    { id: 1, name: "Dr. João Silva", specialty: "Dermatologia", color: "bg-blue-100 dark:bg-blue-900/20" },
    { id: 2, name: "Dra. Ana Costa", specialty: "Estética", color: "bg-green-100 dark:bg-green-900/20" },
    { id: 3, name: "Dra. Maria Santos", specialty: "Clínica Geral", color: "bg-purple-100 dark:bg-purple-900/20" }
  ];

  // Horários de 8:00 às 18:00 com intervalos de 30 min
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

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
      setEditingAppointment(appointment);
      setEditingDoctor(doctor);
      setIsEditorOpen(true);
    }
  };

  const handleNewAppointment = (doctor: string, time: string) => {
    setEditingAppointment(null);
    setEditingDoctor(doctor);
    setIsEditorOpen(true);
  };

  const handleSaveAppointment = (appointment: Appointment) => {
    setAppointments(prev => {
      const newAppointments = { ...prev };
      
      if (!newAppointments[editingDoctor]) {
        newAppointments[editingDoctor] = {};
      }
      
      newAppointments[editingDoctor][appointment.time] = appointment;
      
      return newAppointments;
    });
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
        time: destTime
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
                          className={`${doctor.color} p-1.5 text-center border border-border rounded`}
                        >
                          <p className="font-medium text-xs text-foreground truncate">{doctor.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{doctor.specialty}</p>
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
                            <Droppable key={`${doctor.name}-${timeSlot}`} droppableId={`${doctor.name}-${timeSlot}`}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`min-h-[50px] p-1 border-2 border-dashed rounded transition-colors ${
                                    snapshot.isDraggingOver 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border bg-background hover:bg-muted/50'
                                  }`}
                                  onDoubleClick={() => handleNewAppointment(doctor.name, timeSlot)}
                                >
                                  {appointments[doctor.name]?.[timeSlot] ? (
                                    <Draggable 
                                      draggableId={appointments[doctor.name][timeSlot].id} 
                                      index={0}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`p-1.5 rounded border cursor-move transition-shadow ${
                                            snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                          } ${getStatusColor(appointments[doctor.name][timeSlot].status)}`}
                                        >
                                          <div className="space-y-0.5">
                                            <div className="flex justify-between items-start">
                                              <p className="font-medium text-xs truncate max-w-[120px]">
                                                {appointments[doctor.name][timeSlot].patient}
                                              </p>
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                                    <MoreVertical className="h-3 w-3" />
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-background border-border">
                                                  <DropdownMenuItem onClick={() => handleEditAppointment(doctor.name, timeSlot)}>
                                                    <Edit className="h-3 w-3 mr-2" />
                                                    Editar
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem>
                                                    <Eye className="h-3 w-3 mr-2" />
                                                    Visualizar
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                              {appointments[doctor.name][timeSlot].procedure}
                                            </p>
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-medium">
                                                {appointments[doctor.name][timeSlot].duration}min
                                              </span>
                                              <Badge className={`${getStatusColor(appointments[doctor.name][timeSlot].status)} text-[10px] px-1 py-0`} variant="outline">
                                                {getStatusLabel(appointments[doctor.name][timeSlot].status)}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      )}
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
                    {Object.entries(appointments).map(([doctor, timeSlots]) =>
                      Object.entries(timeSlots).map(([time, appointment]) => (
                        <tr key={appointment.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-foreground">
                                {new Date(appointment.date).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-sm text-muted-foreground">{appointment.time}</p>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-foreground">{appointment.patient}</td>
                          <td className="p-4 text-muted-foreground">{doctor}</td>
                          <td className="p-4 text-muted-foreground">{appointment.procedure}</td>
                          <td className="p-4 text-muted-foreground">{appointment.duration}min</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(appointment.status)} variant="outline">
                              {getStatusLabel(appointment.status)}
                            </Badge>
                          </td>
                          <td className="p-4 space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAppointment(doctor, time)}
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
        appointment={editingAppointment}
        doctor={editingDoctor}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveAppointment}
      />
    </div>
  );
}
