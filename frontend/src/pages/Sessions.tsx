import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  User,
  Eye,
  CheckCircle,
  Clock,
  Calendar,
  Edit,
  Filter
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Sessions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

  // Dados mockados dos prontuários de pacientes
  const patientRecords = [
    {
      id: 1,
      patient: "Maria Silva",
      procedure: "Rejuvenescimento Facial",
      totalSessions: 10,
      completedSessions: 7,
      remainingSessions: 3,
      startDate: "2024-05-01",
      doctor: "Dr. João Silva",
      status: "active",
      lastSession: "2024-06-05"
    },
    {
      id: 2,
      patient: "Ana Costa",
      procedure: "Tratamento Anti-Idade",
      totalSessions: 8,
      completedSessions: 8,
      remainingSessions: 0,
      startDate: "2024-04-15",
      doctor: "Dra. Ana Costa",
      status: "completed",
      lastSession: "2024-07-10"
    },
    {
      id: 3,
      patient: "João Santos",
      procedure: "Hidratação Facial",
      totalSessions: 6,
      completedSessions: 2,
      remainingSessions: 4,
      startDate: "2024-06-01",
      doctor: "Dra. Maria Santos",
      status: "active",
      lastSession: "2024-06-03"
    },
    {
      id: 4,
      patient: "Carla Oliveira",
      procedure: "Peeling Químico",
      totalSessions: 5,
      completedSessions: 3,
      remainingSessions: 2,
      startDate: "2024-05-20",
      doctor: "Dr. João Silva",
      status: "active",
      lastSession: "2024-06-01"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'paused':
        return 'Pausado';
      default:
        return status;
    }
  };

  const filteredRecords = patientRecords.filter(record => {
    const matchesSearch = record.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesDoctor = doctorFilter === "all" || record.doctor === doctorFilter;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const handleViewDetails = (patientId: number) => {
    console.log(`Visualizar detalhes do paciente ${patientId}`);
    // Aqui seria redirecionado para a página de detalhes do prontuário
  };

  const handleEditRecord = (patientId: number) => {
    console.log(`Editar prontuário do paciente ${patientId}`);
  };

  const doctors = [...new Set(patientRecords.map(r => r.doctor))];

  return (
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prontuários de Sessões</h1>
          <p className="text-muted-foreground">Controle e baixa de sessões realizadas</p>
        </div>
      </div>

      {/* Barra de pesquisa e filtros */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-card-foreground">
            <Search className="h-5 w-5 text-primary" />
            <span>Buscar Prontuários</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar por paciente, procedimento ou médico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-input"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-popover border-border">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Filtros</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Médico</label>
                    <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Médico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {doctors.map(doctor => (
                          <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Cards de prontuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="bg-card border-border hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-card-foreground">{record.patient}</CardTitle>
                <Badge className={getStatusColor(record.status)}>
                  {getStatusLabel(record.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{record.procedure}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{record.doctor}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso:</span>
                  <span className="text-foreground font-medium">
                    {record.completedSessions}/{record.totalSessions}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(record.completedSessions / record.totalSessions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {record.remainingSessions > 0 ? (
                    <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      {record.remainingSessions} restantes
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Última: {new Date(record.lastSession).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex space-x-2 pt-2 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(record.id)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditRecord(record.id)}
                  className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredRecords.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhum prontuário encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
