import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateInstallmentInvoiceDto {
  @ApiProperty({
    description: 'ID do paciente',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'ID do protocolo de tratamento',
    example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012'
  })
  @IsUUID()
  protocolId: string;

  @ApiProperty({
    description: 'Número total de parcelas',
    example: 6,
    minimum: 1,
    maximum: 24
  })
  @IsNumber()
  @Min(1)
  @Max(24)
  totalInstallments: number;

  @ApiProperty({
    description: 'Data de vencimento da primeira parcela',
    example: '2024-01-15T00:00:00.000Z'
  })
  @IsDateString()
  firstDueDate: string;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Protocolo de fisioterapia - 6x sem juros',
    required: false
  })
  @IsOptional()
  notes?: string;
}