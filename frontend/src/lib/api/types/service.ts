export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export type ServiceType = 'consultation' | 'injection' | 'massage' | 'drainage' | 'calometry';

export interface ProtocolService {
  id?: string;
  name: string;
  type: ServiceType;
  requiresScheduling: boolean;
  numberOfSessions: number;
  requiresIntervalControl: boolean;
} 