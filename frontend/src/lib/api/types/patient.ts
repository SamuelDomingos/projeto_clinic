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

// NOVA ESTRUTURA DE MEDICAL RECORD
export type MedicalRecordCategory =
  | 'observation'
  | 'evolution'
  | 'private_note'
  | 'attachment'
  | 'prescription'
  | 'exam_request';

export interface MedicalRecordAttachment {
  type: string;
  path: string;
  filename?: string;
  uploadedAt: string;
}

export interface MedicalRecordDoctor {
  id: string;
  name: string;
}

export interface MedicalRecordPatient {
  id: string;
  name: string;
  birthDate?: string;
}

export interface PrescriptionData {
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
}

export interface ExamRequestData {
  exams: string[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  recordCategory: MedicalRecordCategory;
  doctorId: string;
  content: string;
  isPrivate: boolean;
  createdBy: string;
  prescriptionData?: PrescriptionData | null;
  examRequestData?: ExamRequestData | null;
  attachments: MedicalRecordAttachment[];
  createdAt: string;
  updatedAt: string;
  patient?: MedicalRecordPatient;
  doctor?: MedicalRecordDoctor;
}

export interface MedicalReport {
  patient: {
    name: string;
    id: string;
    birthDate: string;
  };
  period: {
    start: string;
    end: string;
  };
  records: Array<{
    id: string;
    date: string;
    recordCategory: MedicalRecordCategory;
    doctorName: string;
    content: string;
    isPrivate: boolean;
    prescriptionData?: PrescriptionData | null;
    examRequestData?: ExamRequestData | null;
    attachments: MedicalRecordAttachment[];
  }>;
  summary: {
    totalRecords: number;
    categories: Record<string, number>;
    doctors: string[];
  };
} 