export type ServiceType = 'consultation' | 'injection' | 'massage' | 'drainage' | 'calometry';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProtocolService {
  id: string;
  numberOfSessions: number;
  requiresIntervalControl: boolean;
  serviceId?: string;
  protocolId?: string;
  createdAt?: string;
  updatedAt?: string;
  service?: {
    id: string;
    name: string;
    type: string;
    requiresScheduling: boolean;
    createdAt: string;
    // outros campos se necessário
  };
  Service?: {
    id: string;
    name: string;
    type: string;
    requiresScheduling: boolean;
    createdAt: string;
    // outros campos se necessário
  };
  defaultDuration?: number;
}

export interface Protocol {
  id: string;
  name: string;
  totalPrice: number;
  services: ProtocolService[];
  protocolServices?: ProtocolService[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProtocolServiceData {
  name: string;
  type: ServiceType;
  requiresScheduling: boolean;
  numberOfSessions: number;
  requiresIntervalControl: boolean;
}

export interface CreateProtocolData {
  name: string;
  totalPrice: number;
  services: CreateProtocolServiceData[];
}

export interface UpdateProtocolData {
  name: string;
  totalPrice: number;
  services: ProtocolService[];
}

export interface PatientProtocol {
  id: string;
  patientId: string;
  protocolId: string;
  purchaseDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  patient?: {
    id: string;
    name: string;
  };
  protocol?: Protocol;
  createdAt: string;
  updatedAt: string;
}

export interface PatientServiceSession {
  id: string;
  patientProtocolId: string;
  protocolServiceId: string;
  sessionNumber: number;
  sessionDate: string;
  observations?: string;
  nextAllowedDate?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  patientProtocol?: PatientProtocol;
  protocolService?: ProtocolService;
  createdAt: string;
  updatedAt: string;
} 