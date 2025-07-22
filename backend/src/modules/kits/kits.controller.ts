import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { KitsService } from './kits.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('kits')
export class KitsController {
  constructor(private readonly kitsService: KitsService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() body: any) {
    return this.kitsService.create(body);
  }

  @Get()
  async findAll() {
    return this.kitsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.kitsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.kitsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return this.kitsService.remove(id);
  }

  @Post('remove-stock')
  @UseGuards(AuthGuard)
  async removeKitStock(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Usuário não autenticado.');
    
    return this.kitsService.removeKitStock({
      ...body,
      userId,
    });
  }
}