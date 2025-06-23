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
  id?: string;
  name: string;
  type: ServiceType;
  requiresScheduling: boolean;
  numberOfSessions: number;
  requiresIntervalControl: boolean;
}

export interface Protocol {
  id: string;
  name: string;
  totalPrice: number;
  services: ProtocolService[];
  ProtocolServices?: ProtocolService[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProtocolData {
  name: string;
  totalPrice: number;
  services: ProtocolService[];
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
  sessionDate: string;
  observations?: string;
  nextAllowedDate?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  patientProtocol?: PatientProtocol;
  protocolService?: ProtocolService;
  createdAt: string;
  updatedAt: string;
} 