import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Stethoscope,
  DollarSign,
  Calendar,
  Package,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientHeader } from "./patient-record/PatientHeader";
import { PersonalData } from "./patient-record/PersonalData";
import { MedicalRecord } from "./patient-record/MedicalRecord";
import AppointmentEditor from "./AppointmentEditor/AppointmentEditor";
import { appointmentApi, type Appointment, type Patient, invoiceApi, type Invoice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PatientInvoices } from "./patient-record/PatientInvoices";

interface PatientRecordProps {
  patient: Patient;
}

export function PatientRecord({ patient }: PatientRecordProps) {
  const [activeTab, setActiveTab] = useState("record");
  const [records, setRecords] = useState<unknown[]>([]); // Substitua por um tipo mais específico se souber
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAppointmentEditorOpen, setIsAppointmentEditorOpen] = useState(false);
  const { toast } = useToast();

  const loadPatientRecords = useCallback(async () => {
    try {
      setLoading(true);
      // Implementar carregamento dos registros médicos
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar registros médicos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.list({ patientId: patient.id });
      setAppointments(response || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive"
      });
      setAppointments([]); // Garante que appointments seja um array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, [appointmentApi, patient.id, toast]);

  useEffect(() => {
    if (patient?.id) {
      loadPatientRecords();
      loadAppointments();
    }
  }, [patient?.id, loadPatientRecords, loadAppointments]);

  const handleAppointmentSave = async (appointment: Appointment) => {
    try {
      await appointmentApi.create(appointment);
      await loadAppointments();
      setIsAppointmentEditorOpen(false);
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento",
        variant: "destructive"
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (!patient?.id) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PatientHeader patient={patient} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted">
          <TabsTrigger value="record" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Prontuário</span>
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Dados</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Consultas</span>
          </TabsTrigger>
          <TabsTrigger value="consumption" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Consumo</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Contas/Orçamentos</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba de Prontuário */}
        <TabsContent value="record">
          <MedicalRecord patientId={patient.id} />
        </TabsContent>

        {/* Aba de Dados Pessoais */}
        <TabsContent value="personal">
          <PersonalData patient={patient} />
        </TabsContent>

        {/* Aba de Consultas */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Histórico de Consultas</CardTitle>
              <Button 
                onClick={() => setIsAppointmentEditorOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Consulta
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">Data</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Horário</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Procedimento</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Doutor</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments && appointments.length > 0 ? (
                        appointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b border-border hover:bg-muted/50">
                            <td className="p-4 text-muted-foreground">{formatDate(appointment.date)}</td>
                            <td className="p-4 text-muted-foreground">{formatTime(appointment.startTime)}</td>
                            <td className="p-4 text-muted-foreground">{appointment.procedure}</td>
                            <td className="p-4 text-muted-foreground">{appointment.doctor?.name || '-'}</td>
                            <td className="p-4">
                              <Badge 
                                variant="outline"
                                className={getStatusColor(appointment.status)}
                              >
                                {getStatusText(appointment.status)}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">
                            Nenhuma consulta encontrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Consumo */}
        <TabsContent value="consumption">
          <Card>
            <CardHeader>
              <CardTitle>Consumo de Materiais</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Conteúdo do consumo será implementado posteriormente */}
              <div className="text-center py-4 text-muted-foreground">
                Em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Contas/Orçamentos */}
        <TabsContent value="billing">
          <PatientInvoices patientId={patient.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
