// src/database/data-source.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { CartItem } from './entities/cart-item.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 1433),
  username: configService.get('DB_USERNAME', 'sa'),
  password: configService.get('DB_PASSWORD', 'YourStrong@Passw0rd'),
  database: configService.get('DB_DATABASE', 'EcommerceDB'),
  entities: [User, Category, Product, CartItem],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});
