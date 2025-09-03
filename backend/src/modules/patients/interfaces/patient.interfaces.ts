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