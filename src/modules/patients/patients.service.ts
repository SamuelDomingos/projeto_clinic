import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async getActivePatients() {
    return this.patientRepository.find({
      where: { status: 'active' },
      order: { name: 'ASC' },
    });
  }

  async getById(id: string) {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    return patient;
  }

  async create(data: Partial<Patient>) {
    const { cpf } = data;
    const existingPatient = await this.patientRepository.findOne({ where: { cpf } });
    if (existingPatient) throw new BadRequestException('CPF já cadastrado');
    const patient = this.patientRepository.create({ ...data, status: 'active' });
    await this.patientRepository.save(patient);
    return patient;
  }

  async update(id: string, data: Partial<Patient>) {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    if (data.cpf && data.cpf !== patient.cpf) {
      const existingPatient = await this.patientRepository.findOne({ where: { cpf: data.cpf } });
      if (existingPatient) throw new BadRequestException('CPF já cadastrado');
    }
    await this.patientRepository.update(id, { ...data });
    return this.getById(id);
  }

  async delete(id: string) {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    await this.patientRepository.update(id, { status: 'inactive' });
    return { message: 'Paciente desativado com sucesso' };
  }

  async getPatientWithHistory(id: string) {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['medicalRecords', 'appointments'],
      order: { medicalRecords: { date: 'DESC' }, appointments: { date: 'DESC' } },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async searchPatients(query: any) {
    const { name, status, startDate, endDate } = query;
    const where: any = {};
    if (name) where.name = ILike(`%${name}%`);
    if (status) where.status = status;
    if (startDate && endDate) where.createdAt = Between(new Date(startDate), new Date(endDate));
    return this.patientRepository.find({ where });
  }

  async updateLastVisit(id: string) {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');
    await this.patientRepository.update(id, {
      lastVisit: new Date(),
      totalSessions: (patient.totalSessions || 0) + 1,
    });
    return this.getById(id);
  }

  findAll(query?: any) {
    return this.getActivePatients();
  }

  findOne(id: string) {
    return this.getById(id);
  }

  remove(id: string) {
    return this.delete(id);
  }

  // Métodos para upload de foto e adicionar prontuário podem ser implementados conforme a infra de upload e medical record
} 