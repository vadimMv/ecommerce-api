import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { CacheKeyRegistry } from '../../common/cache/cache-key-regestry.service';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly ttl = Number(process.env.CACHE_TTL);
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private cacheRegistry: CacheKeyRegistry,
    private categoriesService: CategoriesService,
  ) {}

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 10 } = options;
    const cacheKey = `products:all:page:${page}:limit:${limit}`;

    let result = await this.cacheRegistry.get<PaginatedResult<Product>>(cacheKey);

    if (!result) {
      this.logger.log('Cache MISS - Loading all products');

      const skip = (page - 1) * limit;
      const [products, total] = await this.productsRepository.findAndCount({
        relations: ['category'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      result = {
        data: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      };

      await this.cacheRegistry.set(cacheKey, result, this.ttl, 'products:all');
      this.logger.log('All products cached');
    } else {
      this.logger.log('Cache HIT - All products from cache');
    }

    return result;
  }

  async findByCategory(
    categoryId: number,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 10 } = options;
    const cacheKey = `products:category:${categoryId}:page:${page}:limit:${limit}`;

    let result = await this.cacheRegistry.get<PaginatedResult<Product>>(cacheKey);

    if (!result) {
      this.logger.log(`Cache MISS - Loading products for category ${categoryId}`);

      // Verify category exists
      await this.categoriesService.findById(categoryId);

      const skip = (page - 1) * limit;
      const [products, total] = await this.productsRepository.findAndCount({
        where: { categoryId },
        relations: ['category'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      result = {
        data: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      };

      await this.cacheRegistry.set(cacheKey, result, this.ttl, `products:category:${categoryId}`);
      this.logger.log(`Products cached for category ${categoryId}`);
    } else {
      this.logger.log(`Cache HIT - Products for category ${categoryId} from cache`);
    }

    return result;
  }

  async findById(id: number): Promise<Product> {
    const cacheKey = `product:${id}`;

    let product = await this.cacheRegistry.get<Product>(cacheKey);

    if (!product) {
      this.logger.log(`Cache MISS - Loading product ${id}`);

      product = await this.productsRepository.findOne({
        where: { id },
        relations: ['category'],
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      await this.cacheRegistry.set(cacheKey, product, this.ttl);
      this.logger.log(`Product ${id} cached`);
    } else {
      this.logger.log(`Cache HIT - Product ${id} from cache`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...productData } = createProductDto;

    const category = await this.categoriesService.findByIdSimple(categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productsRepository.create({
      ...productData,
      categoryId,
    });

    const savedProduct = await this.productsRepository.save(product);

    await Promise.all([
      this.cacheRegistry.clearNamespace(`products:category:${product.categoryId}`),
      this.cacheRegistry.clearNamespace('products:all'),
    ]);
    this.logger.log('Product caches invalidated after creation');

    return savedProduct;
  }
}
