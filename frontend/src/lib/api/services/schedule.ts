import { api } from '../index';
import {
  ScheduleType,
  ScheduleConfig,
  ScheduleHoliday,
  ScheduleEvent,
  ScheduleRule,
} from '../types';

// Tipos de Atendimento
export const getScheduleTypes = () => api.get<ScheduleType[]>('/schedule/types');
export const getScheduleType = (id: number | string) => api.get<ScheduleType>(`/schedule/types/${id}`);
export const createScheduleType = (data: Omit<ScheduleType, 'id'>) => api.post<ScheduleType>('/schedule/types', data);
export const updateScheduleType = (id: number | string, data: Partial<ScheduleType>) => api.put<ScheduleType>(`/schedule/types/${id}`, data);
export const deleteScheduleType = (id: number | string) => api.delete(`/schedule/types/${id}`);

// Configurações Gerais
export const getScheduleConfigs = () => api.get<ScheduleConfig[]>('/schedule/config');
export const getScheduleConfig = (id: number | string) => api.get<ScheduleConfig>(`/schedule/config/${id}`);
export const createScheduleConfig = (data: Omit<ScheduleConfig, 'id'>) => api.post<ScheduleConfig>('/schedule/config', data);
export const updateScheduleConfig = (id: number | string, data: Partial<ScheduleConfig>) => api.put<ScheduleConfig>(`/schedule/config/${id}`, data);
export const deleteScheduleConfig = (id: number | string) => api.delete(`/schedule/config/${id}`);

// Feriados
export const getScheduleHolidays = () => api.get<ScheduleHoliday[]>('/schedule/holidays');
export const getScheduleHoliday = (id: number | string) => api.get<ScheduleHoliday>(`/schedule/holidays/${id}`);
export const createScheduleHoliday = (data: Omit<ScheduleHoliday, 'id'>) => api.post<ScheduleHoliday>('/schedule/holidays', data);
export const updateScheduleHoliday = (id: number | string, data: Partial<ScheduleHoliday>) => api.put<ScheduleHoliday>(`/schedule/holidays/${id}`, data);
export const deleteScheduleHoliday = (id: number | string) => api.delete(`/schedule/holidays/${id}`);

// Eventos da Agenda
export const getScheduleEvents = () => api.get<ScheduleEvent[]>('/schedule/events');
export const getScheduleEvent = (id: number | string) => api.get<ScheduleEvent>(`/schedule/events/${id}`);
export const createScheduleEvent = (data: Omit<ScheduleEvent, 'id'>) => api.post<ScheduleEvent>('/schedule/events', data);
export const updateScheduleEvent = (id: number | string, data: Partial<ScheduleEvent>) => api.put<ScheduleEvent>(`/schedule/events/${id}`, data);
export const deleteScheduleEvent = (id: number | string) => api.delete(`/schedule/events/${id}`);

// Regras de Agenda
export const getScheduleRules = () => api.get<ScheduleRule[]>('/schedule/rules');
export const getScheduleRule = (id: number | string) => api.get<ScheduleRule>(`/schedule/rules/${id}`);
export const createScheduleRule = (data: Omit<ScheduleRule, 'id'>) => api.post<ScheduleRule>('/schedule/rules', data);
export const updateScheduleRule = (id: number | string, data: Partial<ScheduleRule>) => api.put<ScheduleRule>(`/schedule/rules/${id}`, data);
export const deleteScheduleRule = (id: number | string) => api.delete(`/schedule/rules/${id}`); 