import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { User as UserIcon, CalendarIcon } from 'lucide-react';
import type { Patient } from '@/lib/api/types/patient';

interface PatientInfoFormProps {
  patientDetailsFormData: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    cpf: string;
    rg: string;
  };
  setPatientDetailsFormData: (data: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    cpf: string;
    rg: string;
  }) => void;
  patients: Patient[];
  patientSearch: string;
  setPatientSearch: (value: string) => void;
  onPatientSelect: (patientId: string) => void;
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
  selectedPatientId: string;
  disableFields?: boolean;
}

export type { PatientInfoFormProps };

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({
  patientDetailsFormData,
  setPatientDetailsFormData,
  patients,
  patientSearch,
  setPatientSearch,
  onPatientSelect,
  popoverOpen,
  setPopoverOpen,
  selectedPatientId,
  disableFields = false,
}) => {
  const filteredPatients = patientSearch.trim()
    ? patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
    : patients;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Paciente */}
      <div className="space-y-2 col-span-full">
        <Label htmlFor="patientId" className="text-sm font-medium">Paciente *</Label>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Input
              value={filteredPatients.find(p => p.id === selectedPatientId)?.name || patientSearch}
              onFocus={() => setPopoverOpen(true)}
              onClick={() => setPopoverOpen(true)}
              onChange={e => setPatientSearch(e.target.value)}
              placeholder="Buscar paciente pelo nome"
              className="h-11 border-2 focus:border-primary"
              autoComplete="off"
            />
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" sideOffset={4} align="start">
            <Command>
              <CommandInput placeholder="Digite para buscar..." value={patientSearch} onValueChange={setPatientSearch} />
              <CommandList>
                {filteredPatients.length === 0 && (
                  <div className="p-4 flex flex-col items-center text-muted-foreground">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                      <UserIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    Nenhum paciente encontrado
                  </div>
                )}
                {filteredPatients.map(patient => (
                  <CommandItem
                    key={patient.id}
                    value={patient.name}
                    onSelect={() => {
                      onPatientSelect(patient.id);
                      setPopoverOpen(false);
                      setPatientSearch('');
                    }}
                  >
                    {patient.photo ? (
                      <img src={patient.photo} alt={patient.name} className="w-7 h-7 rounded-full object-cover mr-2" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <span>{patient.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{patient.cpf}</span>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="patientCpf" className="text-sm font-medium">CPF do paciente</Label>
        <Input
          id="patientCpf"
          className="h-11 border-2 focus:border-primary"
          value={patientDetailsFormData.cpf || ""}
          onChange={e => setPatientDetailsFormData({ ...patientDetailsFormData, cpf: e.target.value })}
          placeholder="000.000.000-00"
          readOnly={disableFields}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="patientRg" className="text-sm font-medium">RG</Label>
        <Input
          id="patientRg"
          className="h-11 border-2 focus:border-primary"
          value={patientDetailsFormData.rg || ""}
          onChange={e => setPatientDetailsFormData({ ...patientDetailsFormData, rg: e.target.value })}
          placeholder="00.000.000-0"
          readOnly={disableFields}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="patientBirthDate" className="text-sm font-medium">Data de nascimento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-11 justify-start text-left font-normal border-2 focus:border-primary"
              disabled={disableFields}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {patientDetailsFormData.birthDate
                ? new Date(patientDetailsFormData.birthDate).toLocaleDateString("pt-BR")
                : "DD/MM/AAAA"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={patientDetailsFormData.birthDate ? new Date(patientDetailsFormData.birthDate) : undefined}
              onSelect={date => setPatientDetailsFormData({ ...patientDetailsFormData, birthDate: date ? date.toISOString().split("T")[0] : "" })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="patientPhone" className="text-sm font-medium">Telefone</Label>
        <Input
          id="patientPhone"
          className="h-11 border-2 focus:border-primary"
          value={patientDetailsFormData.phone || ""}
          onChange={e => setPatientDetailsFormData({ ...patientDetailsFormData, phone: e.target.value })}
          placeholder="(00) 00000-0000"
          readOnly={disableFields}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="patientEmail" className="text-sm font-medium">E-mail</Label>
        <Input
          id="patientEmail"
          type="email"
          className="h-11 border-2 focus:border-primary"
          value={patientDetailsFormData.email || ""}
          onChange={e => setPatientDetailsFormData({ ...patientDetailsFormData, email: e.target.value })}
          placeholder="email@exemplo.com"
          readOnly={disableFields}
        />
      </div>
    </div>
  );
};

export default PatientInfoForm; 