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

  // Métodos para upload de foto, gerar relatório, etc., podem ser implementados conforme a infra disponível
} 