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

// Mock data para demonstração
const mockPatients = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    birthDate: "1990-01-01",
    cpf: "123.456.789-10",
    rg: "12.345.678-9",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 88888-8888",
    birthDate: "1985-05-15",
    cpf: "987.654.321-00",
    rg: "98.765.432-1",
  },
];

// const mockDoctors = [
//   { id: '1', name: 'Dr. Carlos Oliveira' },
//   { id: '2', name: 'Dra. Ana Paula' },
// ];

interface AppointmentEditorProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => Promise<void>;
  doctors: User[];
  allUsers: User[];
  initialPatient?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    cpf: string;
    rg: string;
  };
  patientId: string;
}

export default function AppointmentEditor({
  appointment,
  isOpen,
  onClose,
  onSave,
  doctors,
  allUsers,
  initialPatient,
  patientId: propPatientId,
}: AppointmentEditorProps) {
  const [formData, setFormData] = useState<any>({
    patientId: propPatientId || '',
    doctorId: appointment?.doctorId || '',
    date: appointment?.date || new Date().toISOString().split('T')[0],
    startTime: appointment?.startTime || '',
    duration: appointment?.duration || 30,
    procedure: appointment?.procedure || '',
    notes: appointment?.notes || ''
  });

  const [selectedTab, setSelectedTab] = useState("scheduling");
  const [patientDetailsFormData, setPatientDetailsFormData] = useState({
    name: initialPatient?.name || '',
    email: initialPatient?.email || '',
    phone: initialPatient?.phone || '',
    birthDate: initialPatient?.birthDate || '',
    cpf: initialPatient?.cpf || '',
    rg: initialPatient?.rg || '',
  });

  const [serviceType, setServiceType] = useState("");
  const [unit, setUnit] = useState("");
  const [requestingProfessional, setRequestingProfessional] = useState("");
  const [patientEnrollment, setPatientEnrollment] = useState("");
  const [patientValidity, setPatientValidity] = useState("");
  const [reimbursementPayment, setReimbursementPayment] = useState(false);
  const [blockSchedule, setBlockSchedule] = useState(false);
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
  const [isDocumentsAttachmentsOpen, setIsDocumentsAttachmentsOpen] =
    useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<Supplier[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadDoctorsAndUsers();
      loadUnits();
    }
  }, [isOpen]);

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
    const selectedPatient = mockPatients.find((p) => p.id === patientId);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Salvando agendamento:", formData);
    // Lógica para salvar bloqueio de agenda ou agendamento
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none rounded-none flex flex-col">
        {/* Header fixo */}
        <div className="border-b bg-background px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-xl font-semibold">
              {blockSchedule ? "Bloquear Agenda" : "Novo Agendamento"}
            </h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

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
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger className="h-11 border-2 focus:border-primary">
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {units && units.length > 0 ? (
                            units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
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
              {/* Tabs fixas */}
              <div className="border-b bg-background px-6 flex-shrink-0">
                <Tabs
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="scheduling">Agendamento</TabsTrigger>
                    <TabsTrigger value="procedure">Procedimento</TabsTrigger>
                    <TabsTrigger value="financial">Financeiro</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Tabs
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="h-full"
              >
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
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div className="space-y-2 col-span-full">
                              <Label
                                htmlFor="patientId"
                                className="text-sm font-medium"
                              >
                                Nome *
                              </Label>
                              {initialPatient ? (
                                <Input
                                  value={initialPatient.name}
                                  className="h-11 border-2 bg-muted"
                                  readOnly
                                />
                              ) : (
                                <Select
                                  value={formData.patientId}
                                  onValueChange={handlePatientSelect}
                                >
                                  <SelectTrigger className="w-full h-11 border-2 focus:border-primary">
                                    <SelectValue placeholder="Selecione ou digite o nome do paciente" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockPatients.map((patient) => (
                                      <SelectItem
                                        key={patient.id}
                                        value={patient.id}
                                      >
                                        {patient.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="patientCpf"
                                className="text-sm font-medium"
                              >
                                CPF do paciente
                              </Label>
                              <Input
                                id="patientCpf"
                                className="h-11 border-2 focus:border-primary"
                                value={patientDetailsFormData.cpf || ""}
                                onChange={(e) =>
                                  setPatientDetailsFormData((prev) => ({
                                    ...prev,
                                    cpf: e.target.value,
                                  }))
                                }
                                placeholder="000.000.000-00"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="patientRg"
                                className="text-sm font-medium"
                              >
                                RG
                              </Label>
                              <Input
                                id="patientRg"
                                className="h-11 border-2 focus:border-primary"
                                value={patientDetailsFormData.rg || ""}
                                onChange={(e) =>
                                  setPatientDetailsFormData((prev) => ({
                                    ...prev,
                                    rg: e.target.value,
                                  }))
                                }
                                placeholder="00.000.000-0"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="patientBirthDate"
                                className="text-sm font-medium"
                              >
                                Data de nascimento
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full h-11 justify-start text-left font-normal border-2 focus:border-primary"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {patientDetailsFormData.birthDate
                                      ? new Date(
                                          patientDetailsFormData.birthDate
                                        ).toLocaleDateString("pt-BR")
                                      : "DD/MM/AAAA"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      patientDetailsFormData.birthDate
                                        ? new Date(
                                            patientDetailsFormData.birthDate
                                          )
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      setPatientDetailsFormData((prev) => ({
                                        ...prev,
                                        birthDate: date
                                          ? date.toISOString().split("T")[0]
                                          : "",
                                      }))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="patientPhone"
                                className="text-sm font-medium"
                              >
                                Telefone
                              </Label>
                              <Input
                                id="patientPhone"
                                className="h-11 border-2 focus:border-primary"
                                value={patientDetailsFormData.phone || ""}
                                onChange={(e) =>
                                  setPatientDetailsFormData((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="(00) 00000-0000"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="patientEmail"
                                className="text-sm font-medium"
                              >
                                E-mail
                              </Label>
                              <Input
                                id="patientEmail"
                                type="email"
                                className="h-11 border-2 focus:border-primary"
                                value={patientDetailsFormData.email || ""}
                                onChange={(e) =>
                                  setPatientDetailsFormData((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                                placeholder="email@exemplo.com"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Seções colapsáveis */}
                        <Collapsible
                          open={isAdditionalInfoOpen}
                          onOpenChange={setIsAdditionalInfoOpen}
                          className="space-y-4"
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-muted/50"
                            >
                              <span className="font-medium">
                                Informações adicionais
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isAdditionalInfoOpen && "rotate-180"
                                )}
                              />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4 px-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <Label
                                  htmlFor="occupation"
                                  className="text-sm font-medium"
                                >
                                  Profissão
                                </Label>
                                <Input
                                  id="occupation"
                                  className="h-11 border-2 focus:border-primary"
                                  placeholder="Ex: Engenheiro"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor="maritalStatus"
                                  className="text-sm font-medium"
                                >
                                  Estado Civil
                                </Label>
                                <Select>
                                  <SelectTrigger className="h-11 border-2 focus:border-primary">
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="single">
                                      Solteiro(a)
                                    </SelectItem>
                                    <SelectItem value="married">
                                      Casado(a)
                                    </SelectItem>
                                    <SelectItem value="divorced">
                                      Divorciado(a)
                                    </SelectItem>
                                    <SelectItem value="widowed">
                                      Viúvo(a)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor="bloodType"
                                  className="text-sm font-medium"
                                >
                                  Tipo Sanguíneo
                                </Label>
                                <Input
                                  id="bloodType"
                                  className="h-11 border-2 focus:border-primary"
                                  placeholder="Ex: O+"
                                />
                              </div>
                              <div className="space-y-2 col-span-full">
                                <Label
                                  htmlFor="allergies"
                                  className="text-sm font-medium"
                                >
                                  Alergias
                                </Label>
                                <Textarea
                                  id="allergies"
                                  className="min-h-20 border-2 focus:border-primary"
                                  placeholder="Liste as alergias conhecidas"
                                />
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        <Collapsible
                          open={isDocumentsAttachmentsOpen}
                          onOpenChange={setIsDocumentsAttachmentsOpen}
                          className="space-y-4"
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-muted/50"
                            >
                              <span className="font-medium">
                                Documentos e anexos
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  isDocumentsAttachmentsOpen && "rotate-180"
                                )}
                              />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4 px-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="uploadDocuments"
                                className="text-sm font-medium"
                              >
                                Fazer Upload de Documentos
                              </Label>
                              <Input
                                id="uploadDocuments"
                                type="file"
                                multiple
                                className="h-11 border-2 focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Lista de documentos anexados (se houver).
                            </p>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Informações do atendimento */}
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-primary border-b pb-2">
                              Informações do atendimento
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <Label
                                htmlFor="doctorId"
                                className="text-sm font-medium"
                              >
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
                              <Label
                                htmlFor="serviceType"
                                className="text-sm font-medium"
                              >
                                Tipo de atendimento *
                              </Label>
                              <Input
                                id="serviceType"
                                className="h-11 border-2 focus:border-primary"
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value)}
                                placeholder="Pesquisar tipo de atendimento"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="unit"
                                className="text-sm font-medium"
                              >
                                Unidade *
                              </Label>
                              <Select value={unit} onValueChange={setUnit}>
                                <SelectTrigger className="h-11 border-2 focus:border-primary">
                                  <SelectValue placeholder="Selecione a unidade" />
                                </SelectTrigger>
                                <SelectContent>
                                  {units && units.length > 0 ? (
                                    units.map((unit) => (
                                      <SelectItem key={unit.id} value={unit.id}>
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
                              <Label
                                htmlFor="date"
                                className="text-sm font-medium"
                              >
                                Data *
                              </Label>
                              <Input
                                id="date"
                                type="date"
                                className="h-11 border-2 focus:border-primary"
                                value={formData.date}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    date: e.target.value,
                                  })
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
                              <Label
                                htmlFor="endTime"
                                className="text-sm font-medium"
                              >
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
                                        return endTime
                                          .toTimeString()
                                          .slice(0, 5);
                                      })()
                                    : ""
                                }
                                readOnly
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="requestingProfessional"
                                className="text-sm font-medium"
                              >
                                Profissional solicitante
                              </Label>
                              <Select
                                value={requestingProfessional}
                                onValueChange={setRequestingProfessional}
                              >
                                <SelectTrigger className="h-11 border-2 focus:border-primary">
                                  <SelectValue placeholder="Selecione o solicitante" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableUsers && availableUsers.length > 0 ? (
                                    availableUsers.map((user) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-users" disabled>
                                      Nenhum usuário disponível
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2 col-span-full">
                              <Label
                                htmlFor="notes"
                                className="text-sm font-medium"
                              >
                                Observações
                              </Label>
                              <Textarea
                                id="notes"
                                className="min-h-20 border-2 focus:border-primary"
                                value={formData.notes}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    notes: e.target.value,
                                  })
                                }
                                placeholder="Adicione observações sobre o agendamento"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="reimbursementPayment"
                                checked={reimbursementPayment}
                                onCheckedChange={(checked) => {
                                  if (typeof checked === "boolean") {
                                    setReimbursementPayment(checked);
                                  }
                                }}
                              />
                              <Label
                                htmlFor="reimbursementPayment"
                                className="text-sm font-medium"
                              >
                                Pagamento via Reembolso
                              </Label>
                            </div>

                            <Button variant="outline" className="ml-auto">
                              Imprimir na Etiqueta / Pulseira
                            </Button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="procedure" className="h-full m-0 p-0">
                  <div className="h-full overflow-y-auto">
                    <div className="p-6 space-y-8">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-primary border-b pb-2">
                          Atendimento
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Select>
                            <SelectTrigger className="h-11 border-2 focus:border-primary">
                              <SelectValue placeholder="1ª Vez com Exames" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="option1">
                                1ª Vez com Exames
                              </SelectItem>
                              <SelectItem value="option2">Retorno</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-primary border-b pb-2">
                          Procedimentos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Select>
                            <SelectTrigger className="h-11 border-2 focus:border-primary">
                              <SelectValue placeholder="Selecionar procedimento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="consultation">
                                CONSULTA 500
                              </SelectItem>
                              <SelectItem value="exam">
                                EXAME DE SANGUE
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center space-x-3">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <span className="font-medium">CONSULTA 500</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                1
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <span className="text-muted-foreground min-w-20 text-center">
                                R$ 550,00
                              </span>
                              <span className="font-semibold min-w-20 text-right">
                                R$ 550,00
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <div className="text-right space-y-1">
                              <p className="text-sm text-muted-foreground">
                                Subtotal: R$ 550,00
                              </p>
                              <p className="text-xl font-bold text-primary">
                                Total: R$ 550,00
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="h-full m-0 p-0">
                  <div className="h-full overflow-y-auto">
                    <div className="p-6 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-card border rounded-lg p-4">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Procedimentos
                          </h3>
                          <p className="text-2xl font-bold text-primary">
                            R$ 550,00
                          </p>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Outras despesas
                          </h3>
                          <p className="text-2xl font-bold">R$ 0,00</p>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Total
                          </h3>
                          <p className="text-2xl font-bold">R$ 550,00</p>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            A Pagar
                          </h3>
                          <p className="text-2xl font-bold text-destructive">
                            R$ 550,00
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="paymentMethod">
                          Forma de Pagamento
                        </Label>
                        <Select>
                          <SelectTrigger className="h-11 border-2 focus:border-primary">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="credit_card">
                              Cartão de Crédito
                            </SelectItem>
                            <SelectItem value="debit_card">
                              Cartão de Débito
                            </SelectItem>
                            <SelectItem value="cash">Dinheiro</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-4">
                          <RadioGroup
                            defaultValue="physical_person"
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="physical_person"
                                id="personType1"
                              />
                              <Label htmlFor="personType1">Pessoa Física</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="legal_person"
                                id="personType2"
                              />
                              <Label htmlFor="personType2">
                                Pessoa Jurídica
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <Label htmlFor="financialNotes">Observação</Label>
                        <Textarea
                          id="financialNotes"
                          className="min-h-20 border-2 focus:border-primary"
                          placeholder="Observações financeiras"
                        />
                        <Button type="button" variant="outline">
                          Adicionar pagamento
                        </Button>
                      </div>
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Resumo</h3>
                        <p className="text-muted-foreground">
                          Nenhum pagamento selecionado
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
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
