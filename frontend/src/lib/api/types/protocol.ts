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
  service: {  // ← ✅ Apenas uma versão, obrigatória
    id: string;
    name: string;
    type: string;
    requiresScheduling: boolean;
    createdAt: string;
  };
  defaultDuration?: number;
}

export interface Protocol {
  id: string;
  name: string;
  totalPrice: number;
  protocolServices: ProtocolService[]; // ← ✅ Apenas um campo, nome consistente
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
  protocolServices: ProtocolService[]; // ← ✅ Consistente
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
  status: 'scheduled' | 'completed';
  patientProtocol?: PatientProtocol;
  protocolService?: ProtocolService;
  createdAt: string;
  updatedAt: string;
}