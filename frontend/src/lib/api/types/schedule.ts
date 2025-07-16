export interface ProtocolServiceConfig {
  serviceId: string;
  numberOfSessions: number;
  defaultDuration: number;
  requiresScheduling: boolean;
  requiresIntervalControl: boolean;
}

export interface ProtocolAndServices {
  protocolId: string;
  services: ProtocolServiceConfig[];
}

export interface ScheduleType {
  id: number;
  name: string;
  displayName: string;
  duration: number;
  color: string;
  scheduleType: 'protocol' | 'single';
  selectedProtocolIds?: string[];
  noSms?: boolean;
  noRegisterSms?: boolean;
  protocolsAndServices?: ProtocolAndServices[];
  costCenter?: string;
  financialDescription?: string;
  receiptDescription?: string;
  classification?: string;
  returnOptions?: string;
  communicationOptions?: string;
  financialOptions?: string;
  createdAt?: string;
}

export interface ScheduleConfig {
  id: number;
  defaultView: string;
  blockInterval: number;
  workingDays: string[];
  startTime: string;
  endTime: string;
  unit: string;
  defaultTypeName: string;
  defaultTypeId?: number;
  notes?: string;
}

export interface ScheduleHoliday {
  id: number;
  name: string;
  type: string;
  day: number;
  month: number;
  year?: number;
}

export interface ScheduleEvent {
  id: number;
  professionalId: number;
  unitId: string;
  type: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
  scheduleTypeId: number;
  status: string;
  notes?: string;
}

export interface ScheduleRule {
  id: number;
  professionalId: number;
  unitId: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  exceptions?: string;
} 