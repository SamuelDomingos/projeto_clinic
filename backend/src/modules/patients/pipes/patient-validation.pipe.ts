import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { CreatePatientRequest, UpdatePatientRequest } from '../interfaces/patient.interfaces';

@Injectable()
export class PatientValidationPipe implements PipeTransform {
  transform(value: CreatePatientRequest | UpdatePatientRequest): CreatePatientRequest | UpdatePatientRequest {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('Dados inválidos fornecidos');
    }

    // Validar CPF se fornecido
    if (value.cpf && !this.validateCPF(value.cpf)) {
      throw new BadRequestException('CPF inválido');
    }

    // Validar telefone se fornecido
    if (value.phone && !this.validatePhone(value.phone)) {
      throw new BadRequestException('Número de telefone inválido');
    }

    // Validar email se fornecido
    if (value.email && !this.validateEmail(value.email)) {
      throw new BadRequestException('Email inválido');
    }

    // Validar data de nascimento se fornecida
    if (value.birthDate && !this.validateBirthDate(value.birthDate)) {
      throw new BadRequestException('Data de nascimento inválida');
    }

    // Sanitizar dados
    return this.sanitizeData(value);
  }

  private validateCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  }

  private validatePhone(phone: string): boolean {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Verifica se tem entre 10 e 11 dígitos (telefone brasileiro)
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateBirthDate(birthDate: string): boolean {
    const date = new Date(birthDate);
    const now = new Date();
    
    // Verifica se é uma data válida
    if (isNaN(date.getTime())) return false;
    
    // Verifica se não é uma data futura
    if (date > now) return false;
    
    // Verifica se a pessoa não tem mais de 150 anos
    const maxAge = new Date();
    maxAge.setFullYear(maxAge.getFullYear() - 150);
    if (date < maxAge) return false;
    
    return true;
  }

  private sanitizeData(data: CreatePatientRequest | UpdatePatientRequest): CreatePatientRequest | UpdatePatientRequest {
    const sanitized = { ...data };
    
    // Sanitizar strings
    if (sanitized.name) {
      sanitized.name = sanitized.name.trim().replace(/\s+/g, ' ');
    }
    
    if (sanitized.email) {
      sanitized.email = sanitized.email.trim().toLowerCase();
    }
    
    if (sanitized.cpf) {
      sanitized.cpf = sanitized.cpf.replace(/\D/g, '');
    }
    
    if (sanitized.phone) {
      sanitized.phone = sanitized.phone.replace(/\D/g, '');
    }
    
    if (sanitized.address) {
      sanitized.address = sanitized.address.trim();
    }
    
    return sanitized;
  }
}