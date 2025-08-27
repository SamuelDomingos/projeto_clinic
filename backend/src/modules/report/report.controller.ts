
import { Controller, Get, Post, Body, Param, Delete, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto, ReportFilterDto } from './entities/report.entity';
import { Response } from 'express';
import * as fs from 'fs/promises';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async create(@Body() dto: CreateReportDto) {
    return this.reportService.create(dto);
  }

  @Get('stats')
  async getStats(@Query('userId') userId?: string) {
    return this.reportService.getReportStats(userId);
  }

  @Get()
  async findAll(@Query() filter: ReportFilterDto) {
    return this.reportService.findAll(filter);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.reportService.findById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.reportService.delete(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    try {
      const { filePath, fileName, mimeType } = await this.reportService.downloadReport(id);
      const file = await fs.readFile(filePath);
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(file);
      
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      return res.status(status).json({
        statusCode: status,
        message: error.message,
        error: status === 404 ? 'Not Found' : 'Internal Server Error'
      });
    }
  }

  @Post('generate')
  async generateAndDownload(@Body() dto: CreateReportDto, @Res() res: Response) {
    try {
      const { filePath, format } = await this.reportService.generateWithoutSaving(dto);
      const file = await fs.readFile(filePath);
      const fileName = `${dto.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format.toLowerCase()}`;
      
      res.setHeader('Content-Type', this.reportService.getMimeType(format));
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(file);
      
      // Clean up temp file
      fs.unlink(filePath).catch(console.error);
      
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: error.message,
        error: 'Internal Server Error'
      });
    }
  }
}
