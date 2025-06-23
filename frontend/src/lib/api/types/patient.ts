export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  lastVisit: string;
  totalSessions: number;
  photo?: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  insurance?: string;
  profession?: string;
  maritalStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'procedure' | 'examination';
  procedure: string;
  doctorName: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'active' | 'inactive';
  evolution?: string;
  attachments?: {
    type: string;
    path: string;
    uploadedAt: string;
  }[];
}

export interface MedicalReport {
  patient: {
    name: string;
    id: string;
    birthDate: string;
    bloodType?: string;
  };
  period: {
    start: string;
    end: string;
  };
  records: {
    date: string;
    type: string;
    procedure: string;
    doctorName: string;
    notes?: string;
    evolution?: string;
    attachments?: {
      type: string;
      path: string;
      uploadedAt: string;
    }[];
  }[];
  summary: {
    totalRecords: number;
    procedures: string[];
    doctors: string[];
  };
} 