// ========================================
// 1. ENTITIES - src/reports/entities/report.entity.ts
// ========================================

import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ReportType {
  SALES = 'SALES',
  FINANCIAL = 'FINANCIAL',
  USER_ACTIVITY = 'USER_ACTIVITY',
  INVENTORY = 'INVENTORY',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

export interface ReportEntity {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  parameters: Record<string, any>;
  filePath?: string;
  fileSize?: number;
  generatedBy: string;
  generatedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateReportDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsObject()
  parameters: Record<string, any>;

  @IsString()
  generatedBy: string;
}

export class ReportFilterDto {
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsString()
  generatedBy?: string;

  @IsOptional()
  dateFrom?: string;

  @IsOptional()
  dateTo?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
