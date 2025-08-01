import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova transação com upload de boleto' })
  @ApiResponse({ status: 201, description: 'Transação criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('boletoFile', {
    storage: diskStorage({
      destination: './uploads/boletos',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
      } else {
        cb(new BadRequestException('Apenas arquivos PDF ou DOC são permitidos!'), false);
      }
    },
  }))
  async create(
    @Body() body: any,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    
    // Validação de boleto removida
    
    const data = { ...body };
    if (file) {
      data.boletoFile = file.filename;
    }
    return this.transactionsService.create(data, userId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Cria múltiplas transações em lote' })
  @ApiResponse({ status: 201, description: 'Transações criadas com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @UseGuards(AuthGuard)
  async createBulk(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    
    // Aceita tanto { transactions: [...] } quanto [...] diretamente
    const transactions = Array.isArray(body) ? body : body.transactions;
    
    if (!Array.isArray(transactions)) {
      throw new BadRequestException('transactions deve ser um array');
    }
    
    return this.transactionsService.createBulk(transactions, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as transações' })
  @ApiResponse({ status: 200, description: 'Lista de transações retornada com sucesso.' })
  async findAll(@Query() query: any) {
    return this.transactionsService.findAll(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo financeiro das transações' })
  @ApiResponse({ status: 200, description: 'Resumo financeiro retornado com sucesso.' })
  async getFinancialSummary(@Query() query: any) {
    return this.transactionsService.getFinancialSummary(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma transação pelo ID' })
  @ApiResponse({ status: 200, description: 'Transação encontrada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada.' })
  async findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma transação existente' })
  @ApiResponse({ status: 200, description: 'Transação atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada.' })
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    return this.transactionsService.update(id, body, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma transação' })
  @ApiResponse({ status: 200, description: 'Transação removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada.' })
  async remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }

  @Post('conciliate-ofx-bulk')
  @ApiOperation({ summary: 'Concilia múltiplas transações OFX em lote' })
  @ApiResponse({ status: 201, description: 'Conciliações realizadas com sucesso.' })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @UseGuards(AuthGuard)
  async conciliateOFXBulk(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    
    const conciliations = body.conciliations;
    if (!Array.isArray(conciliations)) {
      throw new BadRequestException('conciliations deve ser um array');
    }
    
    return this.transactionsService.conciliateOFXBulk(conciliations, userId);
  }
}