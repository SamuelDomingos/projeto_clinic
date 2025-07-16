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
import { CreateTransactionDto } from './create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
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
    @Body() body: CreateTransactionDto,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    if (!file && !body.boletoNumber) {
      throw new BadRequestException('É obrigatório enviar o arquivo do boleto ou o número do boleto.');
    }
    const data = { ...body };
    if (file) {
      data.boletoFile = file.filename;
    }
    return this.transactionsService.create(data, userId);
  }

  @Post('bulk')
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
  async findAll(@Query() query: any) {
    return this.transactionsService.findAll(query);
  }

  @Get('summary')
  async getFinancialSummary(@Query() query: any) {
    return this.transactionsService.getFinancialSummary(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    return this.transactionsService.update(id, body, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
} 