export interface AttendanceSchedule {
  id: string;
  patientId: string;
  userId: string;
  unitId: string;
  date: string;
  startTime: string;
  endTime: string;
  attendanceType: 'protocolo' | 'avulso';
  value: number | null;
  patientProtocolId?: string | null;
  serviceSessionId?: string | null;
  observation?: string;
  isBlocked: boolean;
  blockedByUserId?: string | null;
  blockedByUserName?: string | null;
  blockedUnitId?: string | null;
  blockedStartTime?: string | null;
  blockedEndTime?: string | null;
  createdAt: string;
  updatedAt: string;
  // Relacionamentos
  patient?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  user?: {
    id: string;
    name: string;
    email?: string;
  };
  unit?: {
    id: string;
    name: string;
  };
  protocol?: {
    id: string;
    name: string;
  };
  serviceSession?: {
    id: string;
    name: string;
  };
  sessionNumber?: number;
}

export interface CreateAttendanceScheduleData {
  patientId: string;
  userId: string;
  unitId: string;
  date: string;
  startTime: string;
  endTime: string;
  attendanceType: 'protocolo' | 'avulso';
  value: number | null;
  patientProtocolId?: string | null;
  serviceSessionId?: string | null;
  observation?: string;
  isBlocked?: boolean;
  blockedByUserId?: string | null;
  blockedByUserName?: string | null;
  blockedUnitId?: string | null;
  blockedStartTime?: string | null;
  blockedEndTime?: string | null;
}

export interface UpdateAttendanceScheduleData {
  date?: string;
  startTime?: string;
  endTime?: string;
  attendanceType?: 'protocolo' | 'avulso';
  value?: number | null;
  patientProtocolId?: string | null;
  serviceSessionId?: string | null;
  observation?: string;
  isBlocked?: boolean;
  blockedByUserId?: string | null;
  blockedByUserName?: string | null;
  blockedUnitId?: string | null;
  blockedStartTime?: string | null;
  blockedEndTime?: string | null;
} 