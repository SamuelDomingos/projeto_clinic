import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { User, Supplier } from "@/lib/api";
import { userApi, supplierApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { patientApi } from '@/lib/api/services/patient';
import { getScheduleTypes } from '@/lib/api/services/schedule';
import { patientProtocolApi, patientServiceSessionApi } from '@/lib/api/services/protocol';
import type { Patient } from '@/lib/api/types/patient';
import type { ScheduleType } from '@/lib/api/types/schedule';
import type { PatientProtocol, PatientServiceSession } from '@/lib/api/types/protocol';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { protocolApi } from '@/lib/api/services/protocol';
import type { Protocol } from '@/lib/api/types/protocol';
import PatientInfoForm from './PatientInfoForm';
import AdditionalInfoSection from './AdditionalInfoSection';
import DocumentsAttachmentsSection from './DocumentsAttachmentsSection';
import AppointmentInfoForm from './AppointmentInfoForm';
import type { CreateAttendanceScheduleData } from '@/lib/api/types/attendanceSchedule';
import { attendanceScheduleApi } from '@/lib/api/services/attendanceSchedule';
import { Calendar, CheckCircle, Clock } from "lucide-react";

interface AppointmentEditorCardProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: {
    id: string;
    patientId: string;
    userId: string;
    unitId: string;
    date: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    procedure?: string;
    status?: string;
    notes?: string;
    observation?: string;
    patient?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      birthDate?: string;
      cpf?: string;
      rg?: string;
    };
    professional?: {
      id: string;
      name: string;
    };
    unit?: {
      id: string;
      name: string;
    };
    attendanceType?: 'protocolo' | 'avulso';
    patientProtocol?: {
      id: string;
      name?: string;
    };
    serviceSession?: {
      id: string;
      name?: string;
      sessionNumber?: number;
    };
    isBlocked?: boolean;
    blockedByUserId?: string;
    blockedByUserName?: string;
    value?: number;
    createdAt?: string;
    updatedAt?: string;
  };
  onSave?: (appointment: CreateAttendanceScheduleData) => void;
  doctors?: User[];
  allUsers?: User[];
  patientId?: string;
}

export type FormDataType = {
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  duration: number;
  procedure: string;
  notes?: string;
  unit?: string;
  attendanceType?: string;
  patientProtocolId?: string;
  serviceSessionId?: string;
  sessionNumber?: number;
  endTime?: string;
  isBlocked?: boolean;
  manualEndTime?: boolean;
  blockedByUserId?: string;
  blockedByUserName?: string;
  [key: string]: string | number | boolean | undefined;
};

export default function AppointmentEditorCard({
  isOpen,
  onClose,
  appointment,
}: AppointmentEditorCardProps) {
  const [unit, setUnit] = useState('');
  const [formData, setFormData] = useState<FormDataType>({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: 30,
    procedure: '',
    notes: '',
    unit: '',
    attendanceType: '',
    patientProtocolId: '',
    serviceSessionId: '',
    sessionNumber: undefined,
  });

  useEffect(() => {
    if (appointment && isOpen) {
      console.log('=== APPOINTMENT DATA RECEIVED ===');
      console.log('Full appointment object:', appointment);
      console.log('Unit data:', appointment.unit);
      console.log('Professional data:', appointment.professional);
      console.log('Patient data:', appointment.patient);
      console.log('Protocol data:', appointment.patientProtocol);
      console.log('Service session data:', appointment.serviceSession);
      
      // Verificar se é um bloqueio de agenda
      const isBlocked = appointment.isBlocked;
      setBlockSchedule(isBlocked);
      
      // Calcular duração a partir do horário de início e fim se disponível
      let duration = appointment.duration || 30;
      if (appointment.startTime && appointment.endTime) {
        const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
        const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        duration = endTotalMinutes - startTotalMinutes;
      }

      console.log(appointment);
      
      
      // Dados que serão definidos no formData
      const formDataToSet = {
        patientId: appointment.patient?.id || '',
        doctorId: appointment.professional?.id || '',
        date: appointment.date || new Date().toISOString().split('T')[0],
        startTime: appointment.startTime ? appointment.startTime.substring(0, 5) : '',
        endTime: appointment.endTime ? appointment.endTime.substring(0, 5) : '',
        duration: duration,
        procedure: appointment.procedure || '',
        notes: appointment.observation || '',
        unit: appointment.unit?.id || '',
        attendanceType: appointment.attendanceType || '',
        patientProtocolId: appointment.patientProtocol?.id || '',
        serviceSessionId: appointment.serviceSession?.id || '',
        sessionNumber: appointment.serviceSession?.sessionNumber,
        isBlocked: isBlocked,
        blockedByUserId: appointment.blockedByUserId || '',
        blockedByUserName: appointment.blockedByUserName || '',
        value: appointment.value,
        observation: appointment.observation || '',
      };
      
      console.log('FormData to be set:', formDataToSet);
      
      // Preencher o formulário principal
      setFormData(formDataToSet);
      
      // Definir unidade separadamente para garantir que seja aplicada
      if (appointment.unit?.id) {
        setUnit(appointment.unit.id);
        console.log('Setting unit to:', appointment.unit.id);
      }
      
      // Preencher dados do paciente se disponível (usando dados já presentes no appointment)
      if (appointment.patient) {
        setPatientDetailsFormData({
          name: appointment.patient.name || '',
          email: appointment.patient.email || '',
          phone: appointment.patient.phone || '',
          birthDate: appointment.patient.birthDate || '',
          cpf: appointment.patient.cpf || '',
          rg: appointment.patient.rg || '',
        });
      }
      
      // Definir profissional solicitante
      if (!isBlocked && appointment.professional?.id) {
        setRequestingProfessional(appointment.professional.id);
        console.log('Setting requesting professional (normal):', appointment.professional.id);
      } else if (isBlocked && appointment.blockedByUserId) {
        setRequestingProfessional(appointment.blockedByUserId);
        console.log('Setting requesting professional (blocked):', appointment.blockedByUserId);
      }
      
      // Definir tipo de atendimento
      if (appointment.attendanceType) {
        setSelectedScheduleType(appointment.attendanceType);
        console.log('Setting schedule type:', appointment.attendanceType);
      }
      
      // Se for um protocolo, definir o protocolo selecionado
      if (appointment.patientProtocol) {
        setSelectedProtocolId(appointment.patientProtocol.id || '');
        console.log('Setting protocol ID:', appointment.patientProtocol.id);
      }
      
      // Se tiver sessão de serviço, definir a sessão selecionada
      if (appointment.serviceSession) {
        setSelectedServiceSessionId(appointment.serviceSession.id || '');
        console.log('Setting service session ID:', appointment.serviceSession.id);
      }
      
      console.log('=== END APPOINTMENT DATA PROCESSING ===');
    } else if (isOpen && !appointment) {
      // Reset do formulário para novo agendamento
      setFormData({
        patientId: '',
        doctorId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        duration: 30,
        procedure: '',
        notes: '',
        unit: '',
        attendanceType: '',
        patientProtocolId: '',
        serviceSessionId: '',
        sessionNumber: undefined,
      });
      setPatientDetailsFormData({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        cpf: '',
        rg: '',
      });
      setBlockSchedule(false);
      setRequestingProfessional('');
      setSelectedScheduleType('');
      setSelectedProtocolId('');
      setSelectedServiceSessionId('');
    }
  }, [appointment, isOpen]);

  const [selectedTab, setSelectedTab] = useState("scheduling");
  const [patientDetailsFormData, setPatientDetailsFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    cpf: '',
    rg: '',
  });

  const [requestingProfessional, setRequestingProfessional] = useState("");
  const [reimbursementPayment, setReimbursementPayment] = useState(false);
  const [blockSchedule, setBlockSchedule] = useState(false);
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
  const [isDocumentsAttachmentsOpen, setIsDocumentsAttachmentsOpen] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<Supplier[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([]);
  const [selectedScheduleType, setSelectedScheduleType] = useState<string>('');
  const [patientProtocols, setPatientProtocols] = useState<PatientProtocol[]>([]);
  const [serviceSessions, setServiceSessions] = useState<PatientServiceSession[]>([]);
  const [loadingServiceSessions, setLoadingServiceSessions] = useState(false);
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('');
  const [selectedServiceSessionId, setSelectedServiceSessionId] = useState<string>('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showFinanceiro, setShowFinanceiro] = useState(false);
  const [protocolsAvailable, setProtocolsAvailable] = useState<Protocol[]>([]);
  const [protocolSearch, setProtocolSearch] = useState('');
  const [selectedProtocolsToBuy, setSelectedProtocolsToBuy] = useState<Protocol[]>([]);
  const [pagamentos, setPagamentos] = useState<Array<{
    forma: string;
    valor: string;
    data: string;
    maquina?: string;
    bandeira?: string;
    parcelamento?: string;
    nsu?: string;
    observacao?: string;
    pessoa: 'juridica' | 'fisica';
  }>>([]);
  const [pagamento, setPagamento] = useState({
    forma: '',
    valor: '',
    data: '',
    maquina: '',
    bandeira: '',
    parcelamento: '',
    nsu: '',
    observacao: '',
    pessoa: 'juridica' as 'juridica' | 'fisica',
  });
  const [occupation, setOccupation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [selectedSession, setSelectedSession] = useState<{
    protocolId: string;
    serviceId: string;
    sessionNumber: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Carregar médicos (usuários com role 'health_professional')
      userApi.list({ role: 'health_professional' }).then(setAvailableDoctors);
      // Carregar todos os usuários
      userApi.list().then(setAvailableUsers);
      // Carregar unidades
      supplierApi.getSuppliers({ category: 'unidade' }).then(setUnits);
      // Carregar pacientes
      patientApi.getPatients().then(setPatients);
      // Carregar tipos de atendimento
      getScheduleTypes().then(res => setScheduleTypes(res.data));
      // Carregar protocolos disponíveis
      protocolApi.list().then(setProtocolsAvailable);
    }
  }, [isOpen]);

  // Atualizar o horário de término sempre que a duração ou o horário de início mudar
  useEffect(() => {
    // Só atualiza automaticamente se não for um bloqueio de agenda
    if (formData.startTime && formData.duration && !blockSchedule && !formData.manualEndTime) {
      const [hours, minutes] = formData.startTime.split(":");
      const endTime = new Date();
      endTime.setHours(
        parseInt(hours),
        parseInt(minutes) + formData.duration
      );
      const newEndTime = endTime.toTimeString().slice(0, 5);
      
      if (newEndTime !== formData.endTime) {
        setFormData(prev => ({
          ...prev,
          endTime: newEndTime
        }));
      }
    }
  }, [formData.startTime, formData.duration, blockSchedule, formData.manualEndTime, formData.endTime]);

  // Adicionar este useEffect para marcar quando o usuário edita manualmente
  useEffect(() => {
    const handleEndTimeChange = (e) => {
      if (e.target.id === 'endTime' && document.activeElement === e.target) {
        setFormData(prev => ({
          ...prev,
          manualEndTime: true
        }));
      }
    };

    document.addEventListener('input', handleEndTimeChange);
    return () => document.removeEventListener('input', handleEndTimeChange);
  }, []);

  // Buscar protocolos disponíveis para compra ao abrir aba Protocolos
  useEffect(() => {
    if (selectedTab === 'protocols') {
      protocolApi.list().then(setProtocolsAvailable);
    }
  }, [selectedTab]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isBlocked: blockSchedule,
      // Se for bloqueio de agenda, limpe o patientId
      patientId: blockSchedule ? undefined : prev.patientId
    }));
  }, [blockSchedule]);

  // Habilitar Financeiro automaticamente ao selecionar protocolos para compra
  useEffect(() => {
    setShowFinanceiro(selectedProtocolsToBuy.length > 0);
  }, [selectedProtocolsToBuy]);

  useEffect(() => {
    if (formData.patientId) {
      console.log('Loading protocols for patient:', formData.patientId);
      setLoadingServiceSessions(true);
      Promise.all([
        patientProtocolApi.list(),
        patientServiceSessionApi.list()
      ])
      .then(async ([allProtocols, allSessions]) => {
        // Filtrar protocolos pelo patientId após recebê-los
        const filteredProtocols = allProtocols.filter(p => p.patientId === formData.patientId);
        console.log('Filtered protocols for patient:', filteredProtocols);
        
        // Buscar detalhes completos do protocolo para cada PatientProtocol
        const enriched = await Promise.all(
          filteredProtocols.map(async (p) => {
            if (!p.protocolId) return p;
            try {
              const protocolDetails = await protocolApi.getById(p.protocolId);
              return { ...p, protocol: protocolDetails };
            } catch (e) {
              console.error(`Erro ao buscar detalhes do protocolo ${p.protocolId}`, e);
              return p; // Retorna o protocolo do paciente mesmo se os detalhes falharem
            }
          })
        );
        setPatientProtocols(enriched);
        setServiceSessions(allSessions);
        console.log('Final enriched protocols:', enriched);
        console.log('Service sessions:', allSessions);
      })
      .catch(error => {
        console.error("Erro ao carregar protocolos ou sessões do paciente:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os protocolos e sessões do paciente.",
          variant: "destructive",
        });
        setPatientProtocols([]);
        setServiceSessions([]);
      })
      .finally(() => {
        setLoadingServiceSessions(false);
      });
    } else {
      setPatientProtocols([]);
      setServiceSessions([]);
    }
  }, [formData.patientId, toast]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação dos campos obrigatórios
    const baseRequiredFields = [
      { key: 'doctorId', label: 'Profissional' },
      { key: 'unit', label: 'Unidade' },
      { key: 'date', label: 'Data' },
      { key: 'startTime', label: 'Horário de início' },
    ];

    // Adiciona validação do profissional solicitante
    if (!requestingProfessional) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        description: "Selecione o profissional solicitante.",
        variant: "destructive",
      });
      return;
    }
    
    // Adiciona campo de paciente apenas se não for bloqueio de agenda
    const requiredFields = blockSchedule 
      ? baseRequiredFields 
      : [...baseRequiredFields, { key: 'patientId', label: 'Paciente' }];
    const missing = requiredFields.filter(f => {
      const value = formData[f.key];
      return !value || value === '' || value === 'no-units';
    });
    if (missing.length > 0) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        description: "Faltam: " + missing.map(f => f.label).join(', '),
        variant: "destructive",
      });
      return;
    }
    if (!blockSchedule && !formData.attendanceType) {
      toast({
        title: "Selecione o tipo de atendimento",
        description: "Escolha entre avulso ou protocolo.",
        variant: "destructive",
      });
      return;
    }

    // Calcular o horário de término se não estiver definido
    let endTime = formData.endTime;
    if (!endTime && formData.startTime && formData.duration) {
      const [hours, minutes] = formData.startTime.split(":");
      const endTimeDate = new Date();
      endTimeDate.setHours(
        parseInt(hours),
        parseInt(minutes) + formData.duration
      );
      endTime = endTimeDate.toTimeString().slice(0, 5);
    }

    try {
      // Montar payload com tipos corretos e sem campos undefined
      const payload: CreateAttendanceScheduleData = {
        patientId: String(formData.patientId),
        userId: String(formData.doctorId),
        unitId: String(formData.unit),
        date: String(formData.date),
        startTime: String(formData.startTime),
        endTime: endTime ? String(endTime) : '',
        attendanceType: formData.attendanceType as 'protocolo' | 'avulso',
        value: typeof formData.value === 'number' ? formData.value : (formData.value ? Number(formData.value) : null),
        observation: typeof formData.observation !== 'undefined' ? String(formData.observation) : '',
        isBlocked: typeof formData.isBlocked === 'boolean' ? formData.isBlocked : false,
      };

      // Adicionar campos condicionalmente
      if (!blockSchedule && formData.patientId) {
        payload.patientId = String(formData.patientId);
        payload.attendanceType = formData.attendanceType as 'protocolo' | 'avulso';
        payload.value = typeof formData.value === 'number' ? formData.value : (formData.value ? Number(formData.value) : null);
      }

      if (formData.observation) {
        payload.observation = String(formData.observation);
      }
      
      // Adicionar informações de bloqueio se for um bloqueio
      if (blockSchedule) {
        // Encontrar o usuário selecionado como profissional solicitante
        const requestingUser = availableUsers.find(user => user.id === requestingProfessional);
        
        payload.blockedByUserId = requestingProfessional;
        payload.blockedByUserName = requestingUser?.name || '';
        payload.blockedUnitId = String(formData.unit);
        payload.blockedStartTime = String(formData.startTime);
        payload.blockedEndTime = endTime ? String(endTime) : '';
      }
      
      if (typeof formData.patientProtocolId !== 'undefined' && formData.patientProtocolId !== '') {
        payload.patientProtocolId = String(formData.patientProtocolId);
      }
      if (typeof formData.serviceSessionId !== 'undefined' && formData.serviceSessionId !== '') {
        payload.serviceSessionId = String(formData.serviceSessionId);
      } else if (formData.attendanceType === 'protocolo') {
        toast({
          title: 'Selecione uma sessão',
          description: 'Para agendar um atendimento de protocolo, selecione uma sessão disponível.',
          variant: 'destructive',
        });
        return;
      }
      
      await attendanceScheduleApi.create(payload);
      toast({
        title: "Agendamento criado com sucesso!",
        description: "O atendimento foi agendado.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao criar agendamento",
        description: error?.message || JSON.stringify(error),
        variant: "destructive",
      });
    }
  };
  
  // BUSCA DE PACIENTES PARA AUTOCOMPLETE
  const filteredPatients = patientSearch.trim()
    ? patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
    : patients;

  // SESSÕES UTILIZADAS POR PROTOCOLO
  const getSessionsForProtocol = (protocolId: string): PatientServiceSession[] =>
    serviceSessions.filter((s: PatientServiceSession) => s.patientProtocolId === protocolId);

  const filteredProtocols = protocolSearch.trim()
    ? protocolsAvailable.filter(p => p.name.toLowerCase().includes(protocolSearch.toLowerCase()))
    : protocolsAvailable;

  const handleBuyProtocols = async () => {
    if (!formData.patientId) {
      toast({
        title: "Erro ao comprar protocolos",
        description: "Selecione um paciente para comprar protocolos.",
        variant: "destructive",
      });
      return;
    }
    const protocolIdsToBuy = selectedProtocolsToBuy.map(p => p.id);
    if (protocolIdsToBuy.length === 0) {
      toast({
        title: "Nenhum protocolo selecionado",
        description: "Selecione pelo menos um protocolo para comprar.",
        variant: "destructive",
      });
      return;
    }
    try {
      for (const protocol of selectedProtocolsToBuy) {
        await patientProtocolApi.create({ patientId: formData.patientId, protocolId: protocol.id });
      }
      toast({
        title: "Protocolos comprados",
        description: `Protocolos comprados com sucesso.`,
      });
      setSelectedProtocolsToBuy([]);
      // Atualizar protocolos adquiridos
      const updated = await patientProtocolApi.list();
      setPatientProtocols(updated.filter(p => p.patientId === formData.patientId));
    } catch (error) {
      toast({
        title: "Erro ao comprar protocolos",
        description: "Ocorreu um erro ao tentar comprar os protocolos.",
        variant: "destructive",
      });
    }
  };

  const valorProcedimentos = selectedProtocolsToBuy.reduce((acc, p) => acc + Number(p.totalPrice || 0), 0);
  const valorDespesas = 0;
  const valorTotal = valorProcedimentos + valorDespesas;
  const valorPagamentos = pagamentos.reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const valorAPagar = Math.max(valorTotal - valorPagamentos, 0);

  const handleAddPagamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagamento.forma || !pagamento.valor || !pagamento.data) return;
    setPagamentos([...pagamentos, pagamento]);
    setPagamento({
      forma: '', valor: '', data: '', maquina: '', bandeira: '', parcelamento: '', nsu: '', observacao: '', pessoa: 'juridica',
    });
  };
  const removerPagamento = (idx: number) => {
    setPagamentos(pagamentos.filter((_, i) => i !== idx));
  };

  // Função para marcar/agendar sessão
  async function handleMarkSession(protocol, ps, sessionNumber) {
    setSelectedSession({
      protocolId: protocol.id,
      serviceId: ps.id,
      sessionNumber,
    });
    setFormData(prev => ({
      ...prev,
      patientProtocolId: protocol.id,
      serviceSessionId: `${ps.id}-${sessionNumber}`,
      sessionNumber,
    }));
    setSelectedTab('scheduling');
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none flex flex-col">
        {/* Header fixo */}
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-4">
                <span className="text-xl font-semibold">
                  {blockSchedule ? "Bloquear Agenda" : "Novo Agendamento"}
                </span>
                {/* Botões de navegação de página ao lado do título */}
                <Tabs
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                  className="w-auto ml-4"
                >
                  <TabsList className="flex gap-2">
                    <TabsTrigger value="scheduling">Agendamento</TabsTrigger>
                    {!blockSchedule && <TabsTrigger value="protocols">Protocolos</TabsTrigger>}
                    {showFinanceiro && <TabsTrigger value="financial">Financeiro</TabsTrigger>}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-hidden">
          {blockSchedule ? (
            <div className="h-full overflow-y-auto p-6 space-y-8">
              <form
                onSubmit={handleSubmit}
                className="space-y-8"
                id="appointment-form"
              >
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">
                    Informações do atendimento
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="doctorId" className="text-sm font-medium">
                        Nome do profissional *
                      </Label>
                      <Select
                        value={formData.doctorId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, doctorId: value })
                        }
                      >
                        <SelectTrigger className="h-11 border-2 focus:border-primary">
                          <SelectValue placeholder="Selecione o profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDoctors && availableDoctors.length > 0 ? (
                            availableDoctors.map((doc) => (
                              <SelectItem key={doc.id} value={doc.id}>
                                {doc.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-doctors" disabled>
                              Nenhum profissional disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit" className="text-sm font-medium">
                        Unidade *
                      </Label>
                      <Select
                        value={String(formData.unit ?? "")}
                        onValueChange={value => setFormData(prev => ({ ...prev, unit: String(value) }))}
                      >
                        <SelectTrigger className="h-11 border-2 focus:border-primary">
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {units && units.length > 0 ? (
                            units.map((unit) => (
                              <SelectItem key={String(unit.id)} value={String(unit.id)}>
                                {unit.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-units" disabled>
                              Nenhuma unidade disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
            <Label htmlFor="requestingProfessional" className="text-sm font-medium">
              Profissional solicitante *
            </Label>
            <Select value={requestingProfessional} onValueChange={setRequestingProfessional}>
              <SelectTrigger className="h-11 border-2 focus:border-primary">
                <SelectValue placeholder="Selecione o solicitante" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers && availableUsers.length > 0 ? (
                  availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-users" disabled>Nenhum usuário disponível</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Data *
            </Label>
            <Input
              id="date"
              type="date"
              className="h-11 border-2 focus:border-primary"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="startTime"
                        className="text-sm font-medium"
                      >
                        Início *
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        className="h-11 border-2 focus:border-primary"
                        value={formData.startTime}
                        onChange={(e) => {
                          const newStartTime = e.target.value;
                          // Calcular o horário de término automaticamente
                          let newEndTime = "";
                          if (newStartTime && formData.duration) {
                            const [hours, minutes] = newStartTime.split(":");
                            const endTime = new Date();
                            endTime.setHours(
                              parseInt(hours),
                              parseInt(minutes) + formData.duration
                            );
                            newEndTime = endTime.toTimeString().slice(0, 5);
                          }
                          setFormData({
                            ...formData,
                            startTime: newStartTime,
                            endTime: newEndTime,
                          });
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium">
                        Duração (minutos) *
                      </Label>
                      <Select
                        value={String(formData.duration)}
                        onValueChange={(value) => {
                          const newDuration = parseInt(value);
                          // Calcular o horário de término automaticamente
                          let newEndTime = "";
                          if (formData.startTime && newDuration) {
                            const [hours, minutes] = formData.startTime.split(":");
                            const endTime = new Date();
                            endTime.setHours(
                              parseInt(hours),
                              parseInt(minutes) + newDuration
                            );
                            newEndTime = endTime.toTimeString().slice(0, 5);
                          }
                          setFormData({
                            ...formData,
                            duration: newDuration,
                            endTime: newEndTime,
                          });
                        }}
                      >
                        <SelectTrigger className="h-11 border-2 focus:border-primary">
                          <SelectValue placeholder="Selecione a duração" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="45">45 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm font-medium">
                        Término
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        className="h-11 border-2 focus:border-primary"
                        value={formData.endTime || ""}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 col-span-full">
                      <Label htmlFor="notes" className="text-sm font-medium">
                        Observações
                      </Label>
                      <Textarea
                        id="notes"
                        className="min-h-20 border-2 focus:border-primary"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Adicione observações sobre o bloqueio"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <>

              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
                <TabsContent value="scheduling" className="h-full m-0 p-0">
                  <div className="h-full overflow-y-auto">
                    <div className="p-6 space-y-8">
                      <form
                        onSubmit={handleSubmit}
                        className="space-y-8"
                        id="appointment-form"
                      >
                        {/* Informações do paciente */}
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-primary border-b pb-2">
                            Informações do paciente
                          </h3>
                          <PatientInfoForm
                            patientDetailsFormData={patientDetailsFormData}
                            setPatientDetailsFormData={setPatientDetailsFormData}
                            patients={patients}
                            patientSearch={patientSearch}
                            setPatientSearch={setPatientSearch}
                            onPatientSelect={(patientId) => {
                                            setFormData(prev => ({
                                              ...prev,
                                patientId
                              }));
                              const selectedPatient = patients.find((p) => p.id === patientId);
                              if (selectedPatient) {
                                            setPatientDetailsFormData({
                                  name: selectedPatient.name,
                                  email: selectedPatient.email,
                                  phone: selectedPatient.phone,
                                  birthDate: selectedPatient.birthDate,
                                  cpf: selectedPatient.cpf,
                                  rg: selectedPatient.rg,
                                });
                              }
                            }}
                            popoverOpen={popoverOpen}
                            setPopoverOpen={setPopoverOpen}
                            selectedPatientId={formData.patientId}
                            disableFields={!!formData.patientId}
                          />
                        </div>

                        {/* Seções colapsáveis */}
                        <AdditionalInfoSection
                          isOpen={isAdditionalInfoOpen}
                          setIsOpen={setIsAdditionalInfoOpen}
                          occupation={occupation}
                          setOccupation={setOccupation}
                          maritalStatus={maritalStatus}
                          setMaritalStatus={setMaritalStatus}
                          bloodType={bloodType}
                          setBloodType={setBloodType}
                          allergies={allergies}
                          setAllergies={setAllergies}
                        />
                        <DocumentsAttachmentsSection
                          isOpen={isDocumentsAttachmentsOpen}
                          setIsOpen={setIsDocumentsAttachmentsOpen}
                          onFilesChange={setFiles}
                        />
                        {/* Informações do atendimento */}
                        <AppointmentInfoForm
                          formData={formData}
                          setFormData={setFormData}
                          availableDoctors={availableDoctors}
                          availableUsers={availableUsers}
                          units={units}
                          scheduleTypes={scheduleTypes}
                          selectedScheduleType={selectedScheduleType}
                          setSelectedScheduleType={setSelectedScheduleType}
                          requestingProfessional={requestingProfessional}
                          setRequestingProfessional={setRequestingProfessional}
                          notes={formData.notes as string || ''}
                          setNotes={notes => setFormData({ ...formData, notes })}
                          reimbursementPayment={reimbursementPayment}
                          setReimbursementPayment={setReimbursementPayment}
                        />

                      </form>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="protocols" className="h-full m-0 p-0">
                  <div className="h-full overflow-y-auto">
                    <div className="p-6 space-y-8">

                      {/* Protocolos já adquiridos */}
                      <h4 className="font-semibold mb-4 mt-8 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Protocolos Agendados para hoje
                      </h4>
                      
                      {/* Mostrar informações da sessão agendada se existir */}
                      {appointment?.serviceSession && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-7 h-7" />
                            <div>
                              <h5 className="font-bold text-blue-800 dark:text-blue-200 text-lg">Sessão Agendada para este Atendimento</h5>
                              <p className="text-blue-600 dark:text-blue-400 text-sm">Esta é a sessão específica que será realizada neste agendamento</p>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Sessão:</span>
                                <div className="font-bold text-blue-800 dark:text-blue-200">{appointment.serviceSession.sessionNumber} de {appointment.serviceSession.totalSessions}</div>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Tipo de Serviço:</span>
                                <div className="font-bold text-blue-800 dark:text-blue-200 capitalize">
                                  {appointment.serviceSession.protocolService?.service?.name || 'Serviço não identificado'}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Categoria:</span>
                                <div className="font-bold text-blue-800 dark:text-blue-200 capitalize">
                                  {appointment.serviceSession.protocolService?.service?.type || 'Não definido'}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400 font-medium">Status:</span>
                                <div className="font-bold text-blue-800 dark:text-blue-200 capitalize flex items-center gap-2">
                                  {appointment.serviceSession.status === 'scheduled' ? (
                                    <>
                                      <Calendar className="w-4 h-4" />
                                      Agendada
                                    </>
                                  ) : appointment.serviceSession.status === 'completed' ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Realizada
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-4 h-4" />
                                      {appointment.serviceSession.status}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {patientProtocols.length === 0 ? (
                        <div className="text-muted-foreground text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <div className="text-4xl mb-2">📋</div>
                          <div>Nenhum protocolo adquirido</div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {showFinanceiro && (
                  <TabsContent value="financial">
                    <div className="p-6 space-y-8">
                      {/* Resumo financeiro */}
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        <div>
                          <div className="text-xs text-muted-foreground">Procedimentos</div>
                          <div className="text-xl font-bold">R$ {valorProcedimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Outras despesas</div>
                          <div className="text-xl font-bold">R$ {valorDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Total</div>
                          <div className="text-xl font-bold text-primary">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">A Pagar</div>
                          <div className="text-xl font-bold text-destructive">R$ {valorAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                      {/* Formulário de pagamento */}
                      <form onSubmit={handleAddPagamento} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                          <Label>Forma de Pagamento</Label>
                          <Select value={pagamento.forma} onValueChange={v => setPagamento(p => ({ ...p, forma: v }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cartao">Cartão</SelectItem>
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Valor</Label>
                          <Input type="number" value={pagamento.valor} onChange={e => setPagamento(p => ({ ...p, valor: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Data da transação</Label>
                          <Input type="date" value={pagamento.data} onChange={e => setPagamento(p => ({ ...p, data: e.target.value }))} />
                        </div>
                        <div>
                          <Button type="submit">Adicionar pagamento</Button>
                        </div>
                        <div>
                          <Label>Máquina</Label>
                          <Select value={pagamento.maquina} onValueChange={v => setPagamento(p => ({ ...p, maquina: v }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="maquina1">Maquineta 1</SelectItem>
                              <SelectItem value="maquina2">Maquineta 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Bandeira</Label>
                          <Input value={pagamento.bandeira} onChange={e => setPagamento(p => ({ ...p, bandeira: e.target.value }))} />
                        </div>
                        <div>
                          <Label>Parcelamento</Label>
                          <Select value={pagamento.parcelamento} onValueChange={v => setPagamento(p => ({ ...p, parcelamento: v }))}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1x</SelectItem>
                              <SelectItem value="2">2x</SelectItem>
                              <SelectItem value="3">3x</SelectItem>
                              <SelectItem value="4">4x</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>NSU(DOC/CV/ID)</Label>
                          <Input value={pagamento.nsu} onChange={e => setPagamento(p => ({ ...p, nsu: e.target.value }))} />
                        </div>
                        <div className="col-span-4">
                          <Label>Observação</Label>
                          <Textarea value={pagamento.observacao} onChange={e => setPagamento(p => ({ ...p, observacao: e.target.value }))} />
                        </div>
                        <div className="col-span-4 flex gap-4 items-center">
                          <Label>Pessoa</Label>
                          <RadioGroup value={pagamento.pessoa} onValueChange={v => setPagamento(p => ({ ...p, pessoa: v as 'juridica' | 'fisica' }))} className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="juridica" id="pessoaJ" />
                              <Label htmlFor="pessoaJ">Pessoa Jurídica</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="fisica" id="pessoaF" />
                              <Label htmlFor="pessoaF">Pessoa Física</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </form>
                      {/* Lista de pagamentos adicionados */}
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Pagamentos adicionados</h4>
                        {pagamentos.length === 0 ? (
                          <div className="text-muted-foreground">Nenhum pagamento adicionado</div>
                        ) : (
                          <ul>
                            {pagamentos.map((p, idx) => (
                              <li key={idx} className="flex items-center gap-4 mb-2">
                                <span>{p.forma}</span>
                                <span>R$ {p.valor}</span>
                                <span>{p.data}</span>
                                <Button size="sm" variant="destructive" onClick={() => removerPagamento(idx)}>Remover</Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {/* Botões de ação */}
                      <div className="flex justify-end gap-2 mt-8">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleBuyProtocols} disabled={valorAPagar > 0}>Salvar as alterações</Button>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </div>

        {/* Botões de ação fixos */}
        <div className="flex justify-end space-x-4 p-6 border-t bg-background flex-shrink-0">
          <div className="flex items-center space-x-2 mr-auto">
            <Switch
              id="blockSchedule"
              checked={blockSchedule}
              onCheckedChange={setBlockSchedule}
            />
            <Label htmlFor="blockSchedule" className="text-sm font-medium">
              Bloqueio de Agenda
            </Label>
          </div>
          <Button
            type="button"
            variant="outline"
            className="px-8"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" className="px-8" form="appointment-form">
            {blockSchedule ? "Salvar Bloqueio" : "Criar Agendamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
