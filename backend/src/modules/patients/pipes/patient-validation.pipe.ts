import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
// Importe ou implemente as funções de validação reais
function validateCPF(cpf: string) { return true; }
function validatePhone(phone: string) { return true; }

@Injectable()
export class PatientValidationPipe implements PipeTransform {
  transform(value: any) {
    const { cpf, phone } = value;
    if (cpf && !validateCPF(cpf)) {
      throw new BadRequestException('Invalid CPF');
    }
    if (phone && !validatePhone(phone)) {
      throw new BadRequestException('Invalid phone number');
    }
    return value;
  }
} 