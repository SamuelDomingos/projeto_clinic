import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
// Importe ou implemente as funções de validação reais
function validateCNPJ(cnpj: string) { return true; }
function validatePhone(phone: string) { return true; }

@Injectable()
export class SupplierValidationPipe implements PipeTransform {
  transform(value: any) {
    const { cnpj, phone, type } = value;
    
    if (cnpj && !validateCNPJ(cnpj)) {
      throw new BadRequestException('Invalid CNPJ');
    }
    if (phone && !validatePhone(phone)) {
      throw new BadRequestException('Invalid phone number');
    }
    if (type && !['fornecedor', 'unidade'].includes(type)) {
      throw new BadRequestException('Type must be fornecedor or unidade');
    }
    return value;
  }
} 