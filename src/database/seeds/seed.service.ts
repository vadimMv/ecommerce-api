import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async seedDatabase(): Promise<void> {
    this.logger.log('🌱 Starting database seeding...');

    try {
      // Check if already seeded
      const userCount = await this.usersRepository.count();
      if (userCount > 0) {
        this.logger.log('Database already seeded, skipping...');
        return;
      }

      // Seed in order (due to relationships)
      await this.seedCategories();
      await this.seedProducts();
      await this.seedUsers();

      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  private async seedCategories(): Promise<void> {
    this.logger.log('Seeding categories...');

    const categories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
      },
      {
        name: 'Clothing',
        description: 'Fashion and apparel',
      },
      {
        name: 'Books',
        description: 'Books and educational materials',
      },
      {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies',
      },
      {
        name: 'Sports',
        description: 'Sports and outdoor equipment',
      },
    ];

    await this.categoriesRepository.save(categories);
    this.logger.log(`Created ${categories.length} categories`);
  }

  private async seedProducts(): Promise<void> {
    this.logger.log('Seeding products...');

    // Get categories for relationships
    const electronics = await this.categoriesRepository.findOne({
      where: { name: 'Electronics' },
    });
    const clothing = await this.categoriesRepository.findOne({
      where: { name: 'Clothing' },
    });
    const books = await this.categoriesRepository.findOne({
      where: { name: 'Books' },
    });

    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system',
        price: 999.99,
        stock: 50,
        categoryId: electronics.id,
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Flagship Android smartphone',
        price: 899.99,
        stock: 30,
        categoryId: electronics.id,
      },
      {
        name: 'MacBook Air M3',
        description: 'Lightweight laptop with Apple M3 chip',
        price: 1299.99,
        stock: 25,
        categoryId: electronics.id,
      },
      {
        name: 'AirPods Pro',
        description: 'Wireless earbuds with noise cancellation',
        price: 249.99,
        stock: 100,
        categoryId: electronics.id,
      },
      {
        name: 'Classic T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 19.99,
        stock: 200,
        categoryId: clothing.id,
      },
      {
        name: 'Denim Jeans',
        description: 'Classic blue denim jeans',
        price: 79.99,
        stock: 150,
        categoryId: clothing.id,
      },
      {
        name: 'JavaScript Guide',
        description: 'Complete guide to modern JavaScript',
        price: 39.99,
        stock: 75,
        categoryId: books.id,
      },
      {
        name: 'Clean Code',
        description: 'A handbook of agile software craftsmanship',
        price: 45.99,
        stock: 60,
        categoryId: books.id,
      },
    ];

    await this.productsRepository.save(products);
    this.logger.log(`Created ${products.length} products`);
  }

  private async seedUsers(): Promise<void> {
    this.logger.log('Seeding users...');

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    const users = [
      {
        username: 'demo',
        email: 'demo@example.com',
        password: hashedPassword,
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
      },
    ];

    await this.usersRepository.save(users);
    this.logger.log(`Created ${users.length} users`);
  }
}
