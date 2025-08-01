export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime?: string; // Adicionando a propriedade endTime como opcional
  duration: number;
  procedure: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  doctor?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  duration: number;
  procedure: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  date?: string;
  startTime?: string;
  duration?: number;
  procedure?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}