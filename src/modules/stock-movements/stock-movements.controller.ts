import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    console.log('req.user:', req.user);
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    return this.stockMovementsService.create(body, userId);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.stockMovementsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stockMovementsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.stockMovementsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.stockMovementsService.remove(id);
  }
} 