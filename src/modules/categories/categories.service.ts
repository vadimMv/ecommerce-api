import { Injectable, NotFoundException, ConflictException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CacheKeyRegistry } from '../../common/cache/cache-key-regestry.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private readonly ttl = Number(process.env.CACHE_TTL);
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private cacheRegistry: CacheKeyRegistry,
  ) { }


  async findAll(): Promise<Category[]> {
    const cacheKey = 'categories:all';

    let categories = await this.cacheRegistry.get<Category[]>(cacheKey);

    if (!categories) {
      this.logger.log('Cache MISS - Loading categories from DB');
      categories = await this.categoriesRepository.find({
        order: { name: 'ASC' },
      });
      await this.cacheRegistry.set(cacheKey, categories, this.ttl, 'categories');
      this.logger.log('Categories cached');

    } else {
      this.logger.log('Cache HIT - Categories from cache');
    }

    return categories;
  }

  async findById(id: number): Promise<Category> {
    const cacheKey = `category:${id}:details`;

    let category = await this.cacheRegistry.get<Category>(cacheKey);

    if (!category) {
      this.logger.log(`Cache MISS - Loading category ${id} with products`);

      category = await this.categoriesRepository.findOne({
        where: { id },
        relations: ['products'],
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      await this.cacheRegistry.set(cacheKey, category, this.ttl);
      this.logger.log(`Category ${id} cached with ${category.products.length} products`);
    } else {
      this.logger.log(`Cache HIT - Category ${id} from cache`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }
    await this.cacheRegistry.del('categories:all');
    this.logger.log('Categories cache invalidated');
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async findByIdSimple(id: number): Promise<Category | null> {
    return this.categoriesRepository.findOne({
      where: { id },
    });
  }
}
