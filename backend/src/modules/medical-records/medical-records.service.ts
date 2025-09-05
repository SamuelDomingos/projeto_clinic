import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Or } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createRecord(data: Partial<MedicalRecord>, userId: string) {
    const record = this.medicalRecordRepository.create({
      ...data,
      doctorId: userId || data.doctorId,
      createdBy: userId || data.createdBy,
    });
    await this.medicalRecordRepository.save(record);
    return this.medicalRecordRepository.findOne({
      where: { id: record.id },
      relations: ['patient', 'doctor'],
    });
  }

  async getRecordById(id: string, userId?: string) {
    const record = await this.medicalRecordRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
    if (!record) throw new NotFoundException('Medical record not found');
    if (record.isPrivate && record.createdBy !== userId) {
      throw new ForbiddenException('Access denied to private record');
    }
    return record;
  }

  async getAllRecords(query: any, userId?: string) {
    const { patientId, doctorId, recordCategory, startDate, endDate } = query;
    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (recordCategory) where.recordCategory = recordCategory;
    if (startDate && endDate) where.date = Between(new Date(startDate), new Date(endDate));
    if (userId) {
      where.isPrivate = false;
      where.createdBy = userId;
    } else {
      where.isPrivate = false;
    }
    return this.medicalRecordRepository.find({
      where,
      order: { date: 'DESC' },
      relations: ['patient', 'doctor'],
    });
  }

  async updateRecord(id: string, data: Partial<MedicalRecord>, userId: string) {
    const record = await this.medicalRecordRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Medical record not found');
    if (record.createdBy && record.createdBy !== userId) {
      throw new ForbiddenException('Access denied to edit this record');
    }
    await this.medicalRecordRepository.update(id, data);
    return this.medicalRecordRepository.findOne({ where: { id }, relations: ['patient', 'doctor'] });
  }

  async deleteRecord(id: string, userId: string) {
    const record = await this.medicalRecordRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Medical record not found');
    if (record.createdBy && record.createdBy !== userId) {
      throw new ForbiddenException('Access denied to delete this record');
    }
    await this.medicalRecordRepository.delete(id);
    return { message: 'Registro excluído com sucesso' };
  }

  async getPatientTimeline(patientId: string, query: any, userId?: string) {
    const { recordCategory, startDate, endDate } = query;
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');
    const where: any = { patientId };
    if (recordCategory) where.recordCategory = recordCategory;
    if (startDate && endDate) where.date = Between(new Date(startDate), new Date(endDate));
    if (userId) {
      where.isPrivate = false;
      where.createdBy = userId;
    } else {
      where.isPrivate = false;
    }
    return this.medicalRecordRepository.find({
      where,
      order: { date: 'DESC' },
      relations: ['patient', 'doctor'],
    });
  }

  async addEvolution(recordId: string, content: string) {
    const record = await this.medicalRecordRepository.findOne({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Medical record not found');
    const updatedContent = record.content
      ? `${record.content}\n\n${new Date().toLocaleString()}: ${content}`
      : `${new Date().toLocaleString()}: ${content}`;
    await this.medicalRecordRepository.update(recordId, { content: updatedContent });
    return this.medicalRecordRepository.findOne({ where: { id: recordId } });
  }

  async uploadPhoto(recordId: string, photoPath: string) {
      const record = await this.medicalRecordRepository.findOne({ where: { id: recordId } });
      if (!record) throw new NotFoundException('Medical record not found');
      const updatedAttachments = record.attachments ? [...record.attachments, photoPath] : [photoPath];
      await this.medicalRecordRepository.update(recordId, { attachments: updatedAttachments });
      return this.medicalRecordRepository.findOne({ where: { id: recordId } });
  }

  async generateReport(recordId: string): Promise<string> {
      const record = await this.medicalRecordRepository.findOne({ where: { id: recordId }, relations: ['patient', 'doctor'] });
      if (!record) throw new NotFoundException('Medical record not found');
      const report = `Relatório Médico\n\nPaciente: ${record.patient.name}\nMédico: ${record.doctor.name}\nData: ${record.date}\nCategoria: ${record.recordCategory}\nConteúdo:\n${record.content}`;
      return report;
  }

  create(data: any, userId: string) {
    return this.createRecord(data, userId);
  }

  findAll(query?: any, userId?: string) {
    return this.getAllRecords(query, userId);
  }

  findOne(id: string, userId?: string) {
    return this.getRecordById(id, userId);
  }

  update(id: string, data: any, userId: string) {
    return this.updateRecord(id, data, userId);
  }

  remove(id: string, userId: string) {
    return this.deleteRecord(id, userId);
  }

  // Novos métodos para Gestão de Pacientes
  async getAllPatients(query: any = {}, userId?: string) {
    const { limit = 10, offset = 0, search } = query;
    
    // Query builder para buscar pacientes que têm prontuários
    const queryBuilder = this.medicalRecordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.patient', 'patient')
      .leftJoinAndSelect('record.doctor', 'doctor')
      .select([
        'patient.id',
        'patient.name', 
        'patient.email',
        'patient.phone',
        'patient.birthDate',
        'COUNT(record.id) as totalRecords',
        'MAX(record.date) as lastVisit'
      ])
      .groupBy('patient.id, patient.name, patient.email, patient.phone, patient.birthDate');

    // Filtrar por médico se userId fornecido
    if (userId) {
      queryBuilder.where('record.doctorId = :userId', { userId });
    }

    // Filtrar por nome se search fornecido
    if (search) {
      queryBuilder.andWhere('patient.name ILIKE :search', { search: `%${search}%` });
    }

    // Aplicar paginação
    queryBuilder.limit(limit).offset(offset);

    const patients = await queryBuilder.getRawMany();
    
    return {
      patients,
      total: patients.length,
      limit,
      offset
    };
  }

  async getPatientSummary(patientId: string, userId?: string) {
    // Verificar se o paciente existe
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Construir query base
    const whereCondition: any = { patientId };
    if (userId) {
      whereCondition.doctorId = userId;
    }

    // Buscar estatísticas
    const totalRecords = await this.medicalRecordRepository.count({ where: whereCondition });
    
    const lastRecord = await this.medicalRecordRepository.findOne({
      where: whereCondition,
      order: { date: 'DESC' },
      relations: ['doctor']
    });

    // Contar por categoria
    const categoryCounts = await this.medicalRecordRepository
      .createQueryBuilder('record')
      .select('record.recordCategory', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('record.patientId = :patientId', { patientId })
      .andWhere(userId ? 'record.doctorId = :userId' : '1=1', { userId })
      .groupBy('record.recordCategory')
      .getRawMany();

    // Buscar últimos 5 registros
    const recentRecords = await this.medicalRecordRepository.find({
      where: whereCondition,
      order: { date: 'DESC' },
      take: 5,
      relations: ['doctor']
    });

    return {
      patient,
      statistics: {
        totalRecords,
        lastVisit: lastRecord?.date,
        lastDoctor: lastRecord?.doctor?.name,
        categoryCounts
      },
      recentRecords
    };
  }

  async getPatientHistory(patientId: string, query: any = {}, userId?: string) {
    // Verificar se o paciente existe
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const { category, startDate, endDate, limit = 20, offset = 0 } = query;
    
    // Construir condições where
    const whereCondition: any = { patientId };
    if (userId) {
      whereCondition.doctorId = userId;
    }
    if (category) {
      whereCondition.recordCategory = category;
    }
    if (startDate && endDate) {
      whereCondition.date = Between(new Date(startDate), new Date(endDate));
    }

    // Buscar registros com paginação
    const [records, total] = await this.medicalRecordRepository.findAndCount({
      where: whereCondition,
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['doctor']
    });

    return {
      patient,
      records,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Métodos para upload de foto, gerar relatório, etc., podem ser implementados conforme a infra disponível
}