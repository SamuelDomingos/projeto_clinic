import { Injectable, NotFoundException, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { 
  CreatePatientRequest, 
  UpdatePatientRequest, 
  PatientSearchQuery, 
  PaginatedResponse,
  PatientStatistics,
  MedicalHistoryQuery, // Adicionado
  PatientMedicalHistory, // Adicionado
  MedicalHistoryItem // Adicionado
} from './interfaces/patient.interfaces';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(data: CreatePatientRequest): Promise<Patient> {
    this.logger.log(`Criando novo paciente: ${data.name}`);
    
    try {
      // Verificar se CPF já existe
      await this.validateUniqueFields(data.cpf, data.email);
      
      const patient = this.patientRepository.create({
        ...data,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedPatient = await this.patientRepository.save(patient);
      this.logger.log(`Paciente criado com sucesso: ${savedPatient.id}`);
      
      return savedPatient;
    } catch (error) {
      this.logger.error(`Erro ao criar paciente: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(query: PatientSearchQuery = {}): Promise<PaginatedResponse<Patient>> {
    const { page = 1, limit = 10, name, status, startDate, endDate } = query;
    
    try {
      const queryBuilder = this.patientRepository.createQueryBuilder('patient');
      
      // Aplicar filtros
      if (name) {
        queryBuilder.andWhere('patient.name ILIKE :name', { name: `%${name}%` });
      }
      
      if (status) {
        queryBuilder.andWhere('patient.status = :status', { status });
      }
      
      if (startDate && endDate) {
        queryBuilder.andWhere('patient.createdAt BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        });
      }
      
      // Paginação
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);
      
      // Ordenação
      queryBuilder.orderBy('patient.name', 'ASC');
      
      const [data, total] = await queryBuilder.getManyAndCount();
      
      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar pacientes: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao buscar pacientes');
    }
  }

  async findOne(id: string): Promise<Patient> {
    try {
      const patient = await this.patientRepository.findOne({ where: { id } });
      
      if (!patient) {
        throw new NotFoundException(`Paciente com ID ${id} não encontrado`);
      }
      
      return patient;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erro ao buscar paciente ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao buscar paciente');
    }
  }

  async update(id: string, data: UpdatePatientRequest): Promise<Patient> {
    this.logger.log(`Atualizando paciente: ${id}`);
    
    try {
      const patient = await this.findOne(id);
      
      // Verificar campos únicos se foram alterados
      if (data.cpf && data.cpf !== patient.cpf) {
        await this.validateUniqueFields(data.cpf, undefined, id);
      }
      
      if (data.email && data.email !== patient.email) {
        await this.validateUniqueFields(undefined, data.email, id);
      }
      
      // Preparar dados para update, tratando allergies especialmente
      const updateData: any = { ...data, updatedAt: new Date() };
      if (data.allergies !== undefined) {
        updateData.allergies = data.allergies;
      }
      
      await this.patientRepository.update(id, updateData);
      
      const updatedPatient = await this.findOne(id);
      this.logger.log(`Paciente atualizado com sucesso: ${id}`);
      
      return updatedPatient;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Erro ao atualizar paciente ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao atualizar paciente');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    this.logger.log(`Desativando paciente: ${id}`);
    
    try {
      await this.findOne(id); // Verifica se existe
      
      await this.patientRepository.update(id, {
        status: 'inactive',
        updatedAt: new Date()
      });
      
      this.logger.log(`Paciente desativado com sucesso: ${id}`);
      return { message: 'Paciente desativado com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erro ao desativar paciente ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao desativar paciente');
    }
  }

  async getPatientWithHistory(id: string): Promise<Patient> {
    try {
      const patient = await this.patientRepository.findOne({
        where: { id },
        relations: ['medicalRecords', 'appointments'],
        order: {
          medicalRecords: { date: 'DESC' },
          appointments: { date: 'DESC' }
        }
      });
      
      if (!patient) {
        throw new NotFoundException(`Paciente com ID ${id} não encontrado`);
      }
      
      return patient;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erro ao buscar histórico do paciente ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao buscar histórico do paciente');
    }
  }

  async updateLastVisit(id: string): Promise<Patient> {
    try {
      const patient = await this.findOne(id);
      
      await this.patientRepository.update(id, {
        lastVisit: new Date(),
        totalSessions: (patient.totalSessions || 0) + 1,
        updatedAt: new Date()
      });
      
      return this.findOne(id);
    } catch (error) {
      this.logger.error(`Erro ao atualizar última visita do paciente ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getStatistics(): Promise<PatientStatistics> {
    try {
      const [totalPatients, activePatients, inactivePatients] = await Promise.all([
        this.patientRepository.count(),
        this.patientRepository.count({ where: { status: 'active' } }),
        this.patientRepository.count({ where: { status: 'inactive' } })
      ]);
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const newPatientsThisMonth = await this.patientRepository.count({
        where: {
          createdAt: Between(startOfMonth, new Date())
        }
      });
      
      return {
        totalPatients,
        activePatients,
        inactivePatients,
        newPatientsThisMonth
      };
    } catch (error) {
      this.logger.error(`Erro ao obter estatísticas: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao obter estatísticas');
    }
  }

  private async validateUniqueFields(cpf?: string, email?: string, excludeId?: string): Promise<void> {
    if (cpf) {
      const existingPatientByCpf = await this.patientRepository.findOne({ where: { cpf } });
      if (existingPatientByCpf && existingPatientByCpf.id !== excludeId) {
        throw new ConflictException('CPF já cadastrado');
      }
    }
    
    if (email) {
      const existingPatientByEmail = await this.patientRepository.findOne({ where: { email } });
      if (existingPatientByEmail && existingPatientByEmail.id !== excludeId) {
        throw new ConflictException('Email já cadastrado');
      }
    }
  }

  // Métodos de compatibilidade (mantidos para não quebrar funcionalidades existentes)
  async getActivePatients(): Promise<Patient[]> {
    const result = await this.findAll({ status: 'active', limit: 1000 });
    return result.data;
  }

  async getById(id: string): Promise<Patient> {
    return this.findOne(id);
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.remove(id);
  }

  async searchPatients(query: PatientSearchQuery): Promise<Patient[]> {
    const result = await this.findAll(query);
    return result.data;
  }

  async getPatientMedicalHistory(
    patientId: string, 
    query: MedicalHistoryQuery = {}
  ): Promise<PatientMedicalHistory> {
    this.logger.log(`Buscando histórico médico do paciente: ${patientId}`);
    
    try {
      // Buscar paciente com validação
      const patient = await this.findOne(patientId);
      
      const { 
        startDate, 
        endDate, 
        type = 'all', 
        category, 
        doctorId, 
        page = 1, 
        limit = 50 
      } = query;
      
      // Construir query para appointments
      const appointmentQueryBuilder = this.appointmentRepository
        .createQueryBuilder('appointment')
        .leftJoinAndSelect('appointment.doctor', 'doctor')
        .where('appointment.patientId = :patientId', { patientId })
        .orderBy('appointment.date', 'DESC');
      
      // Construir query para medical records
      const medicalRecordQueryBuilder = this.medicalRecordRepository
        .createQueryBuilder('record')
        .leftJoinAndSelect('record.doctor', 'doctor')
        .where('record.patientId = :patientId', { patientId })
        .orderBy('record.date', 'DESC');
      
      // Aplicar filtros de data
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        appointmentQueryBuilder.andWhere(
          'appointment.date BETWEEN :startDate AND :endDate',
          { startDate: start, endDate: end }
        );
        
        medicalRecordQueryBuilder.andWhere(
          'record.date BETWEEN :startDate AND :endDate',
          { startDate: start, endDate: end }
        );
      }
      
      // Aplicar filtro de médico
      if (doctorId) {
        appointmentQueryBuilder.andWhere('appointment.doctorId = :doctorId', { doctorId });
        medicalRecordQueryBuilder.andWhere('record.doctorId = :doctorId', { doctorId });
      }
      
      // Aplicar filtro de categoria para registros médicos
      if (category) {
        medicalRecordQueryBuilder.andWhere('record.recordCategory = :category', { category });
      }
      
      // Buscar dados baseado no tipo solicitado
      let appointments: Appointment[] = []; // Tipagem explícita
      let medicalRecords: MedicalRecord[] = []; // Tipagem explícita
      
      if (type === 'all' || type === 'appointment') {
        appointments = await appointmentQueryBuilder.getMany();
      }
      
      if (type === 'all' || type === 'medical_record') {
        medicalRecords = await medicalRecordQueryBuilder.getMany();
      }
      
      // Converter para formato unificado
      const historyItems: MedicalHistoryItem[] = [];
      
      // Processar appointments
      appointments.forEach(appointment => {
        historyItems.push({
          id: appointment.id,
          date: appointment.date,
          type: 'appointment',
          title: `Consulta - ${appointment.procedure}`,
          description: appointment.notes || 'Sem observações',
          doctorName: appointment.doctor?.name || 'Médico não informado',
          status: appointment.status,
          category: appointment.procedure
        });
      });
      
      // Processar medical records
      medicalRecords.forEach(record => {
        let title = '';
        switch (record.recordCategory) {
          case 'observation':
            title = 'Observação Médica';
            break;
          case 'evolution':
            title = 'Evolução do Paciente';
            break;
          case 'prescription':
            title = 'Prescrição Médica';
            break;
          case 'exam_request':
            title = 'Solicitação de Exame';
            break;
          case 'attachment':
            title = 'Anexo Médico';
            break;
          case 'private_note':
            title = 'Nota Privada';
            break;
          default:
            title = 'Registro Médico';
        }
        
        historyItems.push({
          id: record.id,
          date: record.date,
          type: 'medical_record',
          title,
          description: record.content || 'Sem conteúdo',
          doctorName: record.doctor?.name || 'Médico não informado',
          category: record.recordCategory,
          attachments: record.attachments,
          prescriptionData: record.prescriptionData,
          examRequestData: record.examRequestData
        });
      });
      
      // Ordenar por data (mais recente primeiro)
      historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Aplicar paginação
      const startIndex = (page - 1) * limit;
      const paginatedHistory = historyItems.slice(startIndex, startIndex + limit);
      
      // Calcular estatísticas
      const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
      const lastAppointment = appointments.length > 0 ? appointments[0].date : undefined;
      const lastMedicalRecord = medicalRecords.length > 0 ? medicalRecords[0].date : undefined;
      
      return {
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          birthDate: patient.birthDate,
          cpf: patient.cpf,
          bloodType: patient.bloodType,
          allergies: patient.allergies,
          insurance: patient.insurance,
          totalSessions: patient.totalSessions,
          lastVisit: patient.lastVisit
        },
        history: paginatedHistory,
        summary: {
          totalAppointments: appointments.length,
          completedAppointments,
          totalMedicalRecords: medicalRecords.length,
          lastAppointment,
          lastMedicalRecord
        }
      };
      
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erro ao buscar histórico médico do paciente ${patientId}: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao buscar histórico médico do paciente');
    }
  }
  
  async getPatientHistorySummary(patientId: string): Promise<any> {
    this.logger.log(`Buscando resumo do histórico do paciente: ${patientId}`);
    
    try {
      const patient = await this.findOne(patientId);
      
      // Buscar estatísticas básicas
      const [totalAppointments, completedAppointments, totalMedicalRecords] = await Promise.all([
        this.appointmentRepository.count({ where: { patientId } }),
        this.appointmentRepository.count({ where: { patientId, status: 'completed' } }),
        this.medicalRecordRepository.count({ where: { patientId } })
      ]);
      
      // Buscar últimos registros
      const [lastAppointment, lastMedicalRecord] = await Promise.all([
        this.appointmentRepository.findOne({
          where: { patientId },
          order: { date: 'DESC' },
          relations: ['doctor']
        }),
        this.medicalRecordRepository.findOne({
          where: { patientId },
          order: { date: 'DESC' },
          relations: ['doctor']
        })
      ]);
      
      // Buscar registros por categoria
      const recordsByCategory = await this.medicalRecordRepository
        .createQueryBuilder('record')
        .select('record.recordCategory', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('record.patientId = :patientId', { patientId })
        .groupBy('record.recordCategory')
        .getRawMany();
      
      return {
        patient: {
          id: patient.id,
          name: patient.name,
          totalSessions: patient.totalSessions,
          lastVisit: patient.lastVisit
        },
        statistics: {
          totalAppointments,
          completedAppointments,
          totalMedicalRecords,
          recordsByCategory: recordsByCategory.reduce((acc, item) => {
            acc[item.category] = parseInt(item.count);
            return acc;
          }, {})
        },
        lastRecords: {
          lastAppointment: lastAppointment ? {
            id: lastAppointment.id,
            date: lastAppointment.date,
            procedure: lastAppointment.procedure,
            doctorName: lastAppointment.doctor?.name,
            status: lastAppointment.status
          } : null,
          lastMedicalRecord: lastMedicalRecord ? {
            id: lastMedicalRecord.id,
            date: lastMedicalRecord.date,
            category: lastMedicalRecord.recordCategory,
            doctorName: lastMedicalRecord.doctor?.name
          } : null
        }
      };
      
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Erro ao buscar resumo do histórico do paciente ${patientId}: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao buscar resumo do histórico do paciente');
    }
  }
}