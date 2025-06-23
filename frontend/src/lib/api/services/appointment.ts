import api, { isAxiosError, ApiError } from '../config';
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from '../types';

export const appointmentApi = {
  list: async (params?: {
    startDate?: string;
    endDate?: string;
    doctorId?: string;
    patientId?: string;
    status?: string;
  }): Promise<Appointment[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
      if (params?.patientId) queryParams.append('patientId', params.patientId);
      if (params?.status) queryParams.append('status', params.status);

      const response = await api.get<Appointment[]>(`/appointments?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao listar agendamentos');
    }
  },

  create: async (data: CreateAppointmentData): Promise<Appointment> => {
    try {
      const response = await api.post<Appointment>('/appointments', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar agendamento');
    }
  },

  update: async (id: string, data: UpdateAppointmentData): Promise<Appointment> => {
    try {
      const response = await api.put<Appointment>(`/appointments/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar agendamento');
    }
  },

  cancel: async (id: string, reason?: string): Promise<Appointment> => {
    try {
      const response = await api.post<Appointment>(`/appointments/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao cancelar agendamento');
    }
  },

  confirm: async (id: string): Promise<Appointment> => {
    try {
      const response = await api.post<Appointment>(`/appointments/${id}/confirm`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao confirmar agendamento');
    }
  },

  complete: async (id: string, notes?: string): Promise<Appointment> => {
    try {
      const response = await api.post<Appointment>(`/appointments/${id}/complete`, { notes });
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao completar agendamento');
    }
  }
}; 