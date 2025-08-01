import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
    
    // PROTEÇÃO: Não permitir editar nome de categorias padrão
    if (category.isDefault && data.name && data.name !== category.name) {
      throw new ForbiddenException('Não é possível alterar o nome de categorias padrão do sistema');
    }
    
    category.name = data.name;
    category.type = data.type;
    category.updatedBy = userId;
    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    
    // PROTEÇÃO: Não permitir deletar categorias padrão
    if (category.isDefault) {
      throw new ForbiddenException('Não é possível deletar categorias padrão do sistema');
    }
    
    await this.categoryRepository.remove(category);
    return { success: true };
  }

  // Método para criar categorias padrão
  async findOrCreateDefaultCategory(type: 'revenue' | 'expense', userId: string = 'system'): Promise<Category> {
    const defaultNames = {
      revenue: 'Receitas de Consultas',
      expense: 'Despesas Operacionais'
    };
    
    let category = await this.categoryRepository.findOne({
      where: { name: defaultNames[type], type, isDefault: true }
    });
    
    if (!category) {
      category = await this.categoryRepository.save({
        name: defaultNames[type],
        type: type,
        isDefault: true, // MARCAR COMO PADRÃO
        createdBy: userId,
        updatedBy: userId
      });
    }
    
    return category;
  }

  async initializeDefaultCategories(): Promise<void> {
    const defaultCategories = [
      { name: 'Receitas de Consultas', type: 'revenue' as const },
      { name: 'Receitas de Procedimentos', type: 'revenue' as const },
      { name: 'Despesas Operacionais', type: 'expense' as const },
      { name: 'Despesas com Estoque', type: 'expense' as const },
      { name: 'Despesas Administrativas', type: 'expense' as const }
    ];
    
    for (const categoryData of defaultCategories) {
      const exists = await this.categoryRepository.findOne({
        where: { name: categoryData.name, type: categoryData.type }
      });
      
      if (!exists) {
        await this.categoryRepository.save({
          ...categoryData,
          isDefault: true, // MARCAR COMO PADRÃO
          createdBy: 'system',
          updatedBy: 'system'
        });
      }
    }
  }
}