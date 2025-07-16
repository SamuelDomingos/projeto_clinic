import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    return this.categoryRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    return category;
  }

  async create(data: any, userId: string): Promise<Category> {
    if (!data.name || !data.type) throw new BadRequestException('Nome e tipo são obrigatórios');
    const category = this.categoryRepository.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
    const saved = await this.categoryRepository.save(category);
    if (Array.isArray(saved)) {
      return saved[0] as Category;
    }
    return saved as Category;
  }

  async update(id: string, data: any, userId: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    category.name = data.name;
    category.type = data.type;
    category.updatedBy = userId;
    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    await this.categoryRepository.remove(category);
    return { success: true };
  }
} 