import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type { User, Supplier } from '@/lib/api';
import type { FormDataType } from './AppointmentEditor';
import type { ScheduleType } from '@/lib/api/types/schedule';

interface AppointmentInfoFormProps {
  formData: FormDataType;
  setFormData: (data: FormDataType) => void;
  availableDoctors: User[];
  availableUsers: User[];
  units: Supplier[];
  scheduleTypes: ScheduleType[];
  selectedScheduleType: string;
  setSelectedScheduleType: (v: string) => void;
  requestingProfessional: string;
  setRequestingProfessional: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  reimbursementPayment: boolean;
  setReimbursementPayment: (v: boolean) => void;
}

const AppointmentInfoForm: React.FC<AppointmentInfoFormProps> = ({
  formData,
  setFormData,
  availableDoctors,
  availableUsers,
  units,
  scheduleTypes,
  selectedScheduleType,
  setSelectedScheduleType,
  requestingProfessional,
  setRequestingProfessional,
  notes,
  setNotes,
  reimbursementPayment,
  setReimbursementPayment,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">
          Informações do atendimento
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="doctorId" className="text-sm font-medium">Nome do profissional *</Label>
          <Select
            value={formData.doctorId}
            onValueChange={value => setFormData({ ...formData, doctorId: value })}
          >
            <SelectTrigger className="h-11 border-2 focus:border-primary">
              <SelectValue placeholder="Selecione o profissional" />
            </SelectTrigger>
            <SelectContent>
              {availableDoctors && availableDoctors.length > 0 ? (
                availableDoctors.map(doc => (
                  <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="no-doctors" disabled>Nenhum profissional disponível</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="attendanceType" className="text-sm font-medium">Tipo de Atendimento *</Label>
          <Select value={selectedScheduleType} onValueChange={setSelectedScheduleType}>
            <SelectTrigger className="h-11 border-2 focus:border-primary">
              <SelectValue placeholder="Selecione o tipo de atendimento" />
            </SelectTrigger>
            <SelectContent>
              {scheduleTypes.map(type => (
                <SelectItem key={String(type.id)} value={String(type.id)}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit" className="text-sm font-medium">Unidade *</Label>
          <Select
            value={typeof formData.unit === 'number' ? String(formData.unit) : (formData.unit ?? '')}
            onValueChange={(value: string) => setFormData({ ...formData, unit: value })}
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
          <Label htmlFor="date" className="text-sm font-medium">Data *</Label>
          <Input
            id="date"
            type="date"
            className="h-11 border-2 focus:border-primary"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime" className="text-sm font-medium">Início *</Label>
          <Input
            id="startTime"
            type="time"
            className="h-11 border-2 focus:border-primary"
            value={formData.startTime}
            onChange={e => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime" className="text-sm font-medium">Término</Label>
          <Input
            id="endTime"
            type="time"
            className="h-11 border-2 bg-muted"
            value={formData.startTime && formData.duration ? (() => {
              const [hours, minutes] = formData.startTime.split(":");
              const endTime = new Date();
              endTime.setHours(parseInt(hours), parseInt(minutes) + formData.duration);
              return endTime.toTimeString().slice(0, 5);
            })() : ""}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="requestingProfessional" className="text-sm font-medium">Profissional solicitante</Label>
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
        <div className="space-y-2 col-span-full">
          <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
          <Textarea
            id="notes"
            className="min-h-20 border-2 focus:border-primary"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Adicione observações sobre o agendamento"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reimbursementPayment"
            checked={reimbursementPayment}
            onCheckedChange={checked => {
              if (typeof checked === 'boolean') setReimbursementPayment(checked);
            }}
          />
          <Label htmlFor="reimbursementPayment" className="text-sm font-medium">Pagamento via Reembolso</Label>
        </div>
        <Button variant="outline" className="ml-auto">Imprimir na Etiqueta / Pulseira</Button>
      </div>
    </div>
  );
};

export default AppointmentInfoForm; 