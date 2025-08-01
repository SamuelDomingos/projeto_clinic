import api, { isAxiosError, ApiError } from '../config';
import { Patient } from '../types';

export const patientApi = {
  getPatients: async (): Promise<Patient[]> => {
    try {
      const response = await api.get<Patient[]>('/patients');
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar pacientes');
    }
  },

  searchPatients: async (searchTerm: string): Promise<Patient[]> => {
    try {
      const response = await api.get<Patient[]>(`/patients/search?q=${searchTerm}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar pacientes');
    }
  },

  createPatient: async (data: Omit<Patient, 'id' | 'lastVisit' | 'totalSessions' | 'createdAt' | 'updatedAt'>): Promise<Patient> => {
    try {
      // Format the data to match backend requirements
      const formattedData = {
        ...data,
        status: data.status || 'active',
        allergies: data.allergies || [],
        maritalStatus: data.maritalStatus || 'single'
      };

      const response = await api.post<Patient>('/patients', formattedData);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const errorData = error.response.data as ApiError;
        console.error('Erro detalhado do backend:', errorData);
        throw new Error(errorData.message || errorData.error || `Erro ${error.response.status}: ${error.response.statusText}`);
      }
      console.error('Erro na requisição:', error);
      throw new Error('Erro ao criar paciente');
    }
  },

  deletePatient: async (id: string): Promise<void> => {
    try {
      await api.delete(`/patients/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar paciente');
    }
  }
};