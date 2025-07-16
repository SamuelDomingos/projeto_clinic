import { IsOptional, IsString, IsNumberString, IsEnum, IsDateString, ValidateIf, Validate, IsNotEmpty } from 'class-validator';
import { TransactionType, TransactionStatus } from './entities/transaction.entity';

export class CreateTransactionDto {
  @IsEnum(['revenue', 'expense'])
  type: TransactionType;

  @IsNumberString()
  amount: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  payableAmount?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'cancelled'])
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  installments?: number;

  @IsOptional()
  installmentNumber?: number;

  @IsOptional()
  @IsDateString()
  paidAt?: Date;

  @IsOptional()
  @IsString()
  paidViaId?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  categoryData?: string;

  @ValidateIf(o => !o.boletoFile)
  @IsString()
  @IsOptional()
  boletoNumber?: string;

  @ValidateIf(o => !o.boletoNumber)
  @IsString()
  @IsOptional()
  boletoFile?: string;
} 