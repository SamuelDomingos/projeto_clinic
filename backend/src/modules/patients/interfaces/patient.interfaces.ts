export interface CreatePatientRequest {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
  rg?: string;
  address?: string;
  emergencyContact?: string;
  profession?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  photo?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  insurance?: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {}

export interface PatientSearchQuery {
  name?: string;
  status?: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PatientStatistics {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
  newPatientsThisMonth: number;
}

// Novas interfaces para histórico médico
export interface MedicalHistoryItem {
  id: string;
  date: Date;
  type: 'appointment' | 'medical_record';
  title: string;
  description: string;
  doctorName?: string;
  status?: string;
  category?: string;
  attachments?: any[];
  prescriptionData?: any;
  examRequestData?: any;
}

export interface PatientMedicalHistory {
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    cpf: string;
    bloodType?: string;
    allergies?: any[];
    insurance?: string;
    totalSessions: number;
    lastVisit?: Date;
  };
  history: MedicalHistoryItem[];
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    totalMedicalRecords: number;
    lastAppointment?: Date;
    lastMedicalRecord?: Date;
  };
}

export interface MedicalHistoryQuery {
  startDate?: string;
  endDate?: string;
  type?: 'appointment' | 'medical_record' | 'all';
  category?: string;
  doctorId?: string;
  page?: number;
  limit?: number;
}