import api, { isAxiosError, ApiError } from '../config';
import { Protocol, ProtocolService, Service, PatientProtocol, PatientServiceSession, CreateProtocolData, UpdateProtocolData } from '../types';

export const protocolApi = {
  // Protocol endpoints
  list: async (): Promise<Protocol[]> => {
    try {
      const response = await api.get<Protocol[]>('/protocols');
      return response.data; // ← ✅ Correto agora!
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        throw new Error((error.response.data as { error: string }).error);
      }
      throw new Error('Erro ao listar protocolos');
    }
  },

  getById: async (id: string): Promise<Protocol> => {
    try {
      const response = await api.get<Protocol>(`/protocols/${id}`);
      return response.data; // ← Sem mapeamento desnecessário
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar protocolo');
    }
  },

  create: async (data: CreateProtocolData): Promise<Protocol> => {
    try {
      const response = await api.post<Protocol>('/protocols', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar protocolo');
    }
  },

  update: async (id: string, data: UpdateProtocolData): Promise<Protocol> => {
    try {
      const response = await api.put<Protocol>(`/protocols/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar protocolo');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/protocols/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar protocolo');
    }
  },

  // Service endpoints
  listServices: async (protocolId: string): Promise<ProtocolService[]> => {
    try {
      const response = await api.get<ProtocolService[]>(`/protocols/${protocolId}/services`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao listar serviços do protocolo');
    }
  },

  addService: async (protocolId: string, data: {
    serviceId: string;
    numberOfSessions: number;
    requiresIntervalControl: boolean;
  }): Promise<ProtocolService> => {
    try {
      const response = await api.post<ProtocolService>(`/protocols/${protocolId}/services`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao adicionar serviço ao protocolo');
    }
  },

  updateService: async (protocolId: string, serviceId: string, data: {
    numberOfSessions?: number;
    requiresIntervalControl?: boolean;
  }): Promise<ProtocolService> => {
    try {
      const response = await api.put<ProtocolService>(`/protocols/${protocolId}/services/${serviceId}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar serviço do protocolo');
    }
  },

  removeService: async (protocolId: string, serviceId: string): Promise<void> => {
    try {
      await api.delete(`/protocols/${protocolId}/services/${serviceId}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao remover serviço do protocolo');
    }
  },

  // Available services catalog
  getAvailableServices: async (): Promise<Service[]> => {
    try {
      const response = await api.get<Service[]>('/services');
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar serviços disponíveis');
    }
  }
};

export const patientProtocolApi = {
  list: async (): Promise<PatientProtocol[]> => {
    try {
      const response = await api.get<PatientProtocol[]>('/patient-protocols');
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao listar protocolos de pacientes');
    }
  },

  getById: async (id: string): Promise<PatientProtocol> => {
    try {
      const response = await api.get<PatientProtocol>(`/patient-protocols/${id}`);
            console.log('[PATIENT-PROTOCOL] response.data:', response.data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar protocolo do paciente');
    }
  },

  create: async (data: {
    patientId: string;
    protocolId: string;
  }): Promise<PatientProtocol> => {
    try {
      const response = await api.post<PatientProtocol>('/patient-protocols', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar protocolo para paciente');
    }
  },

  update: async (id: string, data: {
    status?: 'active' | 'completed' | 'cancelled' | 'paused';
  }): Promise<PatientProtocol> => {
    try {
      const response = await api.put<PatientProtocol>(`/patient-protocols/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar protocolo do paciente');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/patient-protocols/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar protocolo do paciente');
    }
  },

  getSessions: async (id: string): Promise<PatientServiceSession[]> => {
    try {
      const response = await api.get<PatientServiceSession[]>(`/patient-protocols/${id}/sessions`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar sessões do protocolo');
    }
  }
};

export const patientServiceSessionApi = {
  list: async (params?: { patientProtocolId?: string }): Promise<PatientServiceSession[]> => {
    try {
      let url = '/patient-service-sessions';
      if (params && params.patientProtocolId) {
        url += `?patientProtocolId=${encodeURIComponent(params.patientProtocolId)}`;
      }
      const response = await api.get<PatientServiceSession[]>(url);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao listar sessões de serviço');
    }
  },

  getById: async (id: string): Promise<PatientServiceSession> => {
    try {
      const response = await api.get<PatientServiceSession>(`/patient-service-sessions/${id}`);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao buscar sessão de serviço');
    }
  },

  create: async (data: {
    patientProtocolId: string;
    protocolServiceId: string;
    sessionDate: string;
    observations?: string;
    nextAllowedDate?: string;
  }): Promise<PatientServiceSession> => {
    try {
      const response = await api.post<PatientServiceSession>('/patient-service-sessions', data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao criar sessão de serviço');
    }
  },

  update: async (id: string, data: {
    sessionDate?: string;
    observations?: string;
    nextAllowedDate?: string;
    status?: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  }): Promise<PatientServiceSession> => {
    try {
      const response = await api.put<PatientServiceSession>(`/patient-service-sessions/${id}`, data);
      return response.data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao atualizar sessão de serviço');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/patient-service-sessions/${id}`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error((error.response.data as ApiError).error);
      }
      throw new Error('Erro ao deletar sessão de serviço');
    }
  }
};