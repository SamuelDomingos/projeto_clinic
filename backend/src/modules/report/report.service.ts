// ========================================
// 2. SERVICE - src/reports/report.service.ts
// ========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ReportEntity,
  CreateReportDto,
  ReportFilterDto,
  ReportStatus,
  ReportFormat,
  ReportType,
} from './entities/report.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class ReportService {
  private reports: Map<string, ReportEntity> = new Map();
  private readonly reportsDir = path.join(process.cwd(), 'uploads', 'reports');

  constructor() {
    this.ensureReportsDirectory();
  }

  private async ensureReportsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating reports directory:', error);
    }
  }

  async create(dto: CreateReportDto): Promise<ReportEntity> {
    const report: ReportEntity = {
      id: randomUUID(),
      ...dto,
      status: ReportStatus.PENDING,
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reports.set(report.id, report);

    // Process async
    setTimeout(() => this.processReport(report.id), 100);

    return report;
  }

  async findById(id: string): Promise<ReportEntity> {
    const report = this.reports.get(id);
    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }
    return report;
  }

  async findAll(filter: ReportFilterDto = {}) {
    let reports = Array.from(this.reports.values());

    // Apply filters
    if (filter.type) reports = reports.filter((r) => r.type === filter.type);
    if (filter.status)
      reports = reports.filter((r) => r.status === filter.status);
    if (filter.generatedBy)
      reports = reports.filter((r) => r.generatedBy === filter.generatedBy);
    if (filter.dateFrom)
      reports = reports.filter(
        (r) => r.generatedAt >= new Date(filter.dateFrom!),
      );
    if (filter.dateTo)
      reports = reports.filter(
        (r) => r.generatedAt <= new Date(filter.dateTo!),
      );

    // Sort
    reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const total = reports.length;
    const startIndex = (page - 1) * limit;
    const paginatedReports = reports.slice(startIndex, startIndex + limit);

    return {
      reports: paginatedReports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(id: string) {
    const report = this.reports.get(id);
    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }

    if (report.filePath) {
      try {
        await fs.unlink(report.filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    this.reports.delete(id);
    return { message: 'Report deleted successfully' };
  }

  async downloadReport(id: string) {
    const report = this.reports.get(id);
    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }

    if (!report.filePath || report.status !== ReportStatus.COMPLETED) {
      throw new NotFoundException('Report not ready for download');
    }

    try {
      await fs.access(report.filePath);
    } catch (error) {
      throw new NotFoundException('Report file not found');
    }

    return {
      filePath: report.filePath,
      fileName: this.generateFileName(report),
      mimeType: this.getMimeType(report.format),
    };
  }

  async generateWithoutSaving(dto: CreateReportDto) {
    const tempId = randomUUID();
    const fileName = `temp_${tempId}.${dto.format.toLowerCase()}`;
    const filePath = path.join(this.reportsDir, fileName);

    const content = this.generateContent(dto.type, dto.format);
    await fs.writeFile(filePath, content);

    return { filePath, format: dto.format };
  }

  async getReportStats(userId?: string) {
    const reports = Array.from(this.reports.values());
    const filtered = userId
      ? reports.filter((r) => r.generatedBy === userId)
      : reports;

    return {
      total: filtered.length,
      pending: filtered.filter((r) => r.status === ReportStatus.PENDING).length,
      processing: filtered.filter((r) => r.status === ReportStatus.PROCESSING)
        .length,
      completed: filtered.filter((r) => r.status === ReportStatus.COMPLETED)
        .length,
      failed: filtered.filter((r) => r.status === ReportStatus.FAILED).length,
    };
  }

  getMimeType(format: ReportFormat): string {
    const mimeTypes = {
      [ReportFormat.PDF]: 'application/pdf',
      [ReportFormat.EXCEL]:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      [ReportFormat.CSV]: 'text/csv',
      [ReportFormat.JSON]: 'application/json',
    };
    return mimeTypes[format] || 'application/octet-stream';
  }

  private async processReport(id: string) {
    try {
      const report = this.reports.get(id);
      if (!report) return;

      // Update to processing
      report.status = ReportStatus.PROCESSING;
      report.updatedAt = new Date();

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate file
      const fileName = `${id}.${report.format.toLowerCase()}`;
      const filePath = path.join(this.reportsDir, fileName);
      const content = this.generateContent(report.type, report.format);

      await fs.writeFile(filePath, content);
      const stats = await fs.stat(filePath);

      // Update to completed
      report.status = ReportStatus.COMPLETED;
      report.filePath = filePath;
      report.fileSize = stats.size;
      report.completedAt = new Date();
      report.updatedAt = new Date();
    } catch (error) {
      const report = this.reports.get(id);
      if (report) {
        report.status = ReportStatus.FAILED;
        report.errorMessage = error.message;
        report.updatedAt = new Date();
      }
    }
  }

  private generateContent(type: ReportType, format: ReportFormat): string {
    const data = this.getMockData(type);

    switch (format) {
      case ReportFormat.JSON:
        return JSON.stringify(data, null, 2);

      case ReportFormat.CSV:
        if (data.length === 0) return '';
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((row) => Object.values(row).join(',')).join('\n');
        return `${headers}\n${rows}`;

      case ReportFormat.PDF:
        return `PDF Content for ${type}\nData: ${JSON.stringify(data)}`;

      case ReportFormat.EXCEL:
        return `Excel Content for ${type}\nData: ${JSON.stringify(data)}`;

      default:
        return JSON.stringify(data);
    }
  }

  private getMockData(type: ReportType) {
    const mockData = {
      [ReportType.SALES]: [
        { product: 'Product A', sales: 1000, revenue: 5000 },
        { product: 'Product B', sales: 750, revenue: 3750 },
      ],
      [ReportType.FINANCIAL]: [
        { category: 'Revenue', amount: 10000 },
        { category: 'Expenses', amount: 7000 },
      ],
      [ReportType.USER_ACTIVITY]: [
        { user: 'User 1', logins: 45, actions: 230 },
        { user: 'User 2', logins: 32, actions: 180 },
      ],
      [ReportType.INVENTORY]: [
        { item: 'Item A', stock: 100, reserved: 20 },
        { item: 'Item B', stock: 75, reserved: 15 },
      ],
      [ReportType.CUSTOM]: [{ message: 'Custom report data' }],
    };

    return mockData[type] || [];
  }

  private generateFileName(report: ReportEntity): string {
    const cleanTitle = report.title.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    return `${cleanTitle}_${date}.${report.format.toLowerCase()}`;
  }
}
