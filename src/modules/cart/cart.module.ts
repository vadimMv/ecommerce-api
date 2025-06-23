// src/modules/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from '../../database/entities/cart-item.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), ProductsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
