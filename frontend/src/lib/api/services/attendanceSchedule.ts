import api, { isAxiosError, ApiError } from '../config';
import { AttendanceSchedule, CreateAttendanceScheduleData, UpdateAttendanceScheduleData } from '../types/attendanceSchedule';

export const attendanceScheduleApi = {
  list: async (params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    patientId?: string;
    unitId?: string;
    attendanceType?: string;
    isBlocked?: boolean;
  }): Promise<AttendanceSchedule[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.patientId) queryParams.append('patientId', params.patientId);
      if (params?.unitId) queryParams.append('unitId', params.unitId);
      if (params?.attendanceType) queryParams.append('attendanceType', params.attendanceType);
      if (params?.isBlocked !== undefined) queryParams.append('isBlocked', String(params.isBlocked));
      const response = await api.get<AttendanceSchedule[]>(`/attendance-schedules?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao listar agendamentos de atendimento');
    }
  },

  get: async (id: string): Promise<AttendanceSchedule> => {
    try {
      const response = await api.get<AttendanceSchedule>(`/attendance-schedules/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar agendamento de atendimento');
    }
  },

  create: async (data: CreateAttendanceScheduleData): Promise<AttendanceSchedule> => {
    try {
      const response = await api.post<AttendanceSchedule>('/attendance-schedules', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar agendamento de atendimento');
    }
  },

  update: async (id: string, data: UpdateAttendanceScheduleData): Promise<AttendanceSchedule> => {
    try {
      const response = await api.patch<AttendanceSchedule>(`/attendance-schedules/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar agendamento de atendimento');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/attendance-schedules/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar agendamento de atendimento');
    }
  },
}; 