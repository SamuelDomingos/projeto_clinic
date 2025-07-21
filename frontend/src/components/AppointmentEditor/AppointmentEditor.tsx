import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  CalendarIcon,
  Clock,
  ChevronDown,
  Accessibility,
  EarOff,
  User as UserIcon,
  Trash2,
  Minus,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Appointment, User, Supplier } from "@/lib/api";
import { userApi, supplierApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { patientApi } from '@/lib/api/services/patient';
import { getScheduleTypes } from '@/lib/api/services/schedule';
import { patientProtocolApi, patientServiceSessionApi } from '@/lib/api/services/protocol';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import type { Patient } from '@/lib/api/types/patient';
import type { ScheduleType } from '@/lib/api/types/schedule';
import type { PatientProtocol, PatientServiceSession } from '@/lib/api/types/protocol';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { protocolApi } from '@/lib/api/services/protocol';
import type { Protocol } from '@/lib/api/types/protocol';
import PatientInfoForm from './PatientInfoForm';
import AdditionalInfoSection from './AdditionalInfoSection';
import DocumentsAttachmentsSection from './DocumentsAttachmentsSection';
import AppointmentInfoForm from './AppointmentInfoForm';
import type { CreateAttendanceScheduleData } from '@/lib/api/types/attendanceSchedule';
import { attendanceScheduleApi } from '@/lib/api/services/attendanceSchedule';

interface AppointmentEditorProps {
  isOpen: boolean;
  onClose: () => void;
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
  [key: string]: string | number | undefined;
};

export default function AppointmentEditor({
  isOpen,
  onClose,
}: AppointmentEditorProps) {
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

  const [selectedTab, setSelectedTab] = useState("scheduling");
  const [patientDetailsFormData, setPatientDetailsFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    cpf: '',
    rg: '',
  });

  const [serviceType, setServiceType] = useState("");
  const [unit, setUnit] = useState("");
  const [requestingProfessional, setRequestingProfessional] = useState("");
  const [patientEnrollment, setPatientEnrollment] = useState("");
  const [patientValidity, setPatientValidity] = useState("");
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
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('');
  const [selectedServiceSessionId, setSelectedServiceSessionId] = useState<string>('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showFinanceiro, setShowFinanceiro] = useState(false);
  const [protocolsAvailable, setProtocolsAvailable] = useState<Protocol[]>([]);
  const [protocolSearch, setProtocolSearch] = useState('');
  const [protocolSearchOpen, setProtocolSearchOpen] = useState(false);
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

  // Buscar protocolos disponíveis para compra ao abrir aba Protocolos
  useEffect(() => {
    if (selectedTab === 'protocols') {
      protocolApi.list().then(setProtocolsAvailable);
    }
  }, [selectedTab]);

  // Habilitar Financeiro automaticamente ao selecionar protocolos para compra
  useEffect(() => {
    setShowFinanceiro(selectedProtocolsToBuy.length > 0);
  }, [selectedProtocolsToBuy]);

  useEffect(() => {
    if (formData.patientId) {
      patientProtocolApi.list().then(async (allProtocols) => {
        const filtered = allProtocols.filter(p => p.patientId === formData.patientId);
        // Buscar detalhes completos do protocolo para cada PatientProtocol
        const enriched = await Promise.all(filtered.map(async (p) => {
          if (!p.protocolId) return p;
          try {
            const protocolDetails = await protocolApi.getById(p.protocolId);
            return { ...p, protocol: protocolDetails };
          } catch (e) {
            return p;
          }
        }));
        setPatientProtocols(enriched);
      });
    } else {
      setPatientProtocols([]);
    }
  }, [formData.patientId]);

  // Buscar sessões do protocolo do paciente ao selecionar protocolo
  useEffect(() => {
    if (formData.patientProtocolId) {
      patientProtocolApi.getSessions(formData.patientProtocolId).then(setServiceSessions);
    } else {
      setServiceSessions([]);
    }
  }, [formData.patientProtocolId]);

  const loadDoctorsAndUsers = async () => {
    try {
      // Carregar médicos (usuários com role 'health_professional')
      const doctorsResponse = await userApi.list({ role: 'health_professional' });
      if (Array.isArray(doctorsResponse)) {
        setAvailableDoctors(doctorsResponse);
      } else {
        console.error('Resposta inválida ao carregar médicos:', doctorsResponse);
        setAvailableDoctors([]);
      }

      // Carregar todos os usuários para o profissional solicitante
      const usersResponse = await userApi.list();
      if (Array.isArray(usersResponse)) {
        setAvailableUsers(usersResponse);
      } else {
        console.error('Resposta inválida ao carregar usuários:', usersResponse);
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setAvailableDoctors([]);
      setAvailableUsers([]);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await supplierApi.getSuppliers({ category: 'unidade' });
      setUnits(response);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      setUnits([]);
    }
  };

  const handlePatientSelect = (patientId) => {
    setFormData((prev) => ({ ...prev, patientId }));
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação dos campos obrigatórios
    const requiredFields = [
      { key: 'doctorId', label: 'Profissional' },
      { key: 'unit', label: 'Unidade' },
      { key: 'date', label: 'Data' },
      { key: 'startTime', label: 'Horário de início' },
      { key: 'patientId', label: 'Paciente' },
    ];
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
    if (!formData.attendanceType) {
      toast({
        title: "Selecione o tipo de atendimento",
        description: "Escolha entre avulso ou protocolo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: CreateAttendanceScheduleData = {
        patientId: String(formData.patientId),
        userId: String(formData.doctorId),
        unitId: String(formData.unit),
        date: formData.date,
        startTime: String(formData.startTime),
        endTime: String(formData.endTime || ''),
        attendanceType: formData.attendanceType as 'protocolo' | 'avulso',
        value: typeof formData.value === 'number' ? formData.value : null,
        patientProtocolId: formData.patientProtocolId ? String(formData.patientProtocolId) : undefined,
        serviceSessionId: formData.serviceSessionId ? String(formData.serviceSessionId) : undefined,
        observation: formData.notes || '',
        isBlocked: false,
      };
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

  // SESSÕES DISPONÍVEIS (NÃO UTILIZADAS)
  const getAvailableSessions = (protocolId: string) => {
    const protocol = patientProtocols.find(p => p.id === protocolId);
    if (!protocol || !protocol.protocol?.services) return [];
    const sessions = protocol.protocol.services.flatMap(service => {
      const total = typeof service.numberOfSessions === 'string' ? Number(service.numberOfSessions) : service.numberOfSessions || 0;
      const used = getSessionsForProtocol(protocolId).filter(s => s.protocolServiceId === String(service.id) && s.status === 'completed').length;
      let serviceName: string = '';
      if ('name' in service && typeof service.name === 'string') serviceName = service.name;
      else if ('service' in service && service.service && typeof service.service.name === 'string') serviceName = service.service.name;
      else if ('Service' in service && service.Service && typeof service.Service.name === 'string') serviceName = service.Service.name;
      return Array.from({ length: total }, (_, i) => ({
        serviceId: String(service.id),
        serviceName,
        sessionNumber: String(i + 1),
        used: i < used,
      }));
    });
    return sessions;
  };

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
  function handleMarkSession(protocol, ps, sessionNumber) {
    // Buscar a sessão existente para este protocolo, serviço e número
    const session = serviceSessions.find(
      s => s.patientProtocolId === protocol.id &&
           s.protocolServiceId === ps.id &&
           s.sessionNumber === sessionNumber
    );
    setSelectedSession({
      protocolId: protocol.id,
      serviceId: ps.id,
      sessionNumber,
    });
    // Buscar próximo horário disponível para o profissional selecionado
    const slot = getNextAvailableSlot(formData.doctorId);
    const newFormData = {
      ...formData,
      attendanceType: 'protocolo',
      patientProtocolId: protocol.id,
      serviceSessionId: session ? session.id : '', // Usar o id da sessão existente
      sessionNumber,
      date: slot.date,
      startTime: slot.startTime,
      doctorId: formData.doctorId || (availableDoctors[0]?.id || ''),
      unit: formData.unit || (units[0]?.id || ''),
    };
    if ('protocolServiceId' in newFormData) delete newFormData.protocolServiceId;
    setFormData(newFormData);
  }

  // Função para buscar próximo horário disponível (simulação)
  function getNextAvailableSlot(doctorId) {
    // Aqui você pode integrar com sua API real de agenda
    // Simulação: retorna o próximo horário inteiro disponível hoje
    const now = new Date();
    const nextHour = now.getHours() + 1;
    if (nextHour > 17) {
      // Se já passou do horário comercial, sugere amanhã às 8h
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return {
        date: tomorrow.toISOString().split('T')[0],
        startTime: '08:00',
      };
    }
    return {
      date: now.toISOString().split('T')[0],
      startTime: `${String(nextHour).padStart(2, '0')}:00`,
    };
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
                    <TabsTrigger value="protocols">Protocolos</TabsTrigger>
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-sm font-medium">
                        Término
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        className="h-11 border-2 bg-muted"
                        value={
                          formData.startTime && formData.duration
                            ? (() => {
                                const [hours, minutes] =
                                  formData.startTime.split(":");
                                const endTime = new Date();
                                endTime.setHours(
                                  parseInt(hours),
                                  parseInt(minutes) + formData.duration
                                );
                                return endTime.toTimeString().slice(0, 5);
                              })()
                            : ""
                        }
                        readOnly
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
                      {/* Campo de busca de protocolo para compra */}
                      <div>
                        <Label className="font-semibold mb-2">Comprar novos protocolos</Label>
                        <Popover open={protocolSearchOpen} onOpenChange={setProtocolSearchOpen}>
                          <PopoverTrigger asChild>
                            <Input
                              value={protocolSearch}
                              onFocus={() => setProtocolSearchOpen(true)}
                              onChange={e => setProtocolSearch(e.target.value)}
                              placeholder="Buscar protocolo pelo nome"
                              className="h-11 border-2 focus:border-primary"
                              autoComplete="off"
                            />
                          </PopoverTrigger>
                          <PopoverContent className="w-96 p-0" sideOffset={4} align="start">
                            <Command>
                              <CommandInput placeholder="Digite para buscar..." value={protocolSearch} onValueChange={setProtocolSearch} />
                              <CommandList>
                                {filteredProtocols.length === 0 && (
                                  <div className="p-4 flex flex-col items-center text-muted-foreground">
                                    Nenhum protocolo encontrado
                                  </div>
                                )}
                                {filteredProtocols.map(protocol => (
                                  <CommandItem
                                    key={protocol.id}
                                    value={protocol.name}
                                    onSelect={() => {
                                      if (!selectedProtocolsToBuy.some(p => p.id === protocol.id)) {
                                        setSelectedProtocolsToBuy([...selectedProtocolsToBuy, protocol]);
                                      }
                                      setProtocolSearchOpen(false);
                                      setProtocolSearch('');
                                    }}
                                  >
                                    {protocol.name}
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {/* Exibir protocolos selecionados para compra */}
                        {selectedProtocolsToBuy.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedProtocolsToBuy.map(protocol => (
                              <Card key={protocol.id} className="border rounded-lg">
                                <CardHeader>
                                  <CardTitle>{protocol.name}</CardTitle>
                                  <div className="text-xs text-muted-foreground">Valor: R$ {protocol.totalPrice}</div>
                                </CardHeader>
                                <CardContent>
                                  <div className="mb-2 text-xs text-muted-foreground">Serviços:</div>
                                  <ul className="mb-2">
                                    {(protocol.protocolServices || []).map(ps => (
                                      <li key={ps.id} className="flex items-center gap-2">
                                        <span className="font-medium">{ps.service?.name}</span>
                                        <Badge variant="outline">{ps.numberOfSessions} sessões</Badge>
                                      </li>
                                    ))}
                                  </ul>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setSelectedProtocolsToBuy(selectedProtocolsToBuy.filter(p => p.id !== protocol.id))}
                                  >
                                    Remover
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Protocolos já adquiridos */}
                      <h4 className="font-semibold mb-2 mt-8">Protocolos já adquiridos</h4>
                      {patientProtocols.length === 0 ? (
                        <div className="text-muted-foreground text-center py-8">Nenhum protocolo adquirido</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          {patientProtocols.map(protocol => (
                            <Card key={protocol.id} className="border border-green-400 bg-background shadow-sm rounded-lg p-0">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-base font-semibold text-primary">{protocol.protocol?.name || 'Protocolo'}</span>
                                  <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-0.5">Já adquirido</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{protocol.purchaseDate ? new Date(protocol.purchaseDate).toLocaleDateString() : '-'}</div>
                              </CardHeader>
                              <CardContent className="pt-0 pb-3">
                                <div className="space-y-3">
                                {(protocol.protocol?.protocolServices || []).map(ps => {
                                  const total = Number(ps.numberOfSessions) || 0;
                                  const used = getSessionsForProtocol(protocol.id).filter(s => s.protocolServiceId === String(ps.serviceId) && s.status === 'completed').length;
                                  return (
                                      <div key={ps.id} className="flex flex-col gap-0.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-foreground">{ps.service?.name}</span>
                                          <span className="text-xs text-muted-foreground">{used}/{total}</span>
                                      </div>
                                        <div className="flex gap-1 mt-0.5">
                                          {Array.from({ length: total }, (_, i) => {
                                            const isUsed = i < used;
                                            const isSelected =
                                              selectedSession &&
                                              selectedSession.protocolId === protocol.id &&
                                              selectedSession.serviceId === ps.serviceId &&
                                              selectedSession.sessionNumber === i + 1;
                                            return (
                                              <span
                                            key={ps.id + '-' + (i + 1)}
                                                className={
                                                  'inline-block w-4 h-4 rounded-full transition ' +
                                                  (isUsed
                                                    ? 'bg-green-500'
                                                    : isSelected
                                                      ? 'bg-blue-500 ring-2 ring-blue-300 cursor-pointer'
                                                      : 'bg-muted border border-gray-300 cursor-pointer hover:bg-blue-400')
                                                }
                                                title={isUsed ? 'Sessão utilizada' : 'Clique para agendar esta sessão'}
                                                onClick={() => {
                                                  if (!isUsed) handleMarkSession(protocol, ps, i + 1);
                                                }}
                                                style={{ cursor: isUsed ? 'default' : 'pointer' }}
                                              />
                                  );
                                })}
                                      </div>
                                    </div>
                                  );
                                })}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
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
