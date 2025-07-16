import api, { isAxiosError, ApiError } from '../config';
import {
  MedicalRecord,
  MedicalRecordCategory,
  MedicalReport,
  PrescriptionData,
  ExamRequestData,
} from '../types';

export const medicalRecordApi = {
  // 1. Listar todos os registros
  list: async (params?: {
    patientId?: string;
    doctorId?: string;
    recordCategory?: MedicalRecordCategory;
    startDate?: string;
    endDate?: string;
  }): Promise<MedicalRecord[]> => {
    try {
      const response = await api.get<MedicalRecord[]>('/medical-records', { params });
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao listar registros médicos');
    }
  },

  // 2. Buscar registro por ID
  getById: async (id: string): Promise<MedicalRecord> => {
    try {
      const response = await api.get<MedicalRecord>(`/medical-records/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar registro médico');
    }
  },

  // 3. Criar novo registro
  create: async (data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'patient' | 'doctor'>): Promise<MedicalRecord> => {
    try {
      const response = await api.post<MedicalRecord>('/medical-records', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar registro médico');
    }
  },

  // 4. Atualizar registro
  update: async (id: string, data: Partial<Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'patient' | 'doctor'>>): Promise<MedicalRecord> => {
    try {
      const response = await api.put<MedicalRecord>(`/medical-records/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar registro médico');
    }
  },

  // 5. Excluir registro
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/medical-records/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao excluir registro médico');
    }
  },

  // 6. Timeline do paciente
  getPatientTimeline: async (
    patientId: string,
    params?: { recordCategory?: MedicalRecordCategory; startDate?: string; endDate?: string }
  ): Promise<MedicalRecord[]> => {
    try {
      const response = await api.get<MedicalRecord[]>(`/medical-records/patients/${patientId}/timeline`, { params });
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar timeline do paciente');
    }
  },

  // 7. Adicionar evolução
  addEvolution: async (recordId: string, content: string): Promise<MedicalRecord> => {
    try {
      const response = await api.post<MedicalRecord>(`/medical-records/${recordId}/evolution`, { content });
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao adicionar evolução');
    }
  },

  // 8. Upload de foto clínica
  uploadPhoto: async (recordId: string, photo: File): Promise<{ message: string; attachments: any[] }> => {
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      const response = await api.post<{ message: string; attachments: any[] }>(
        `/medical-records/${recordId}/photos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao fazer upload da foto clínica');
    }
  },

  // 9. Gerar relatório médico
  generateReport: async (
    patientId: string,
    params?: { startDate?: string; endDate?: string; recordCategory?: MedicalRecordCategory }
  ): Promise<MedicalReport> => {
    try {
      const response = await api.get<MedicalReport>(
        `/medical-records/patients/${patientId}/report`,
        { params }
      );
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao gerar relatório médico');
    }
  },
}; 