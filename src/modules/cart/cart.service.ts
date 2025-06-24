import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../../database/entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async getCart(userId: number) {
    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    });

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.price),
      0,
    );

    return {
      items: cartItems,
      summary: {
        totalItems,
        totalPrice: Number(totalPrice.toFixed(2)),
        itemCount: cartItems.length,
      },
    };
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    const product = await this.productsService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existingCartItem = await this.cartRepository.findOne({
      where: { userId, productId },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      existingCartItem.quantity = newQuantity;
      await this.cartRepository.save(existingCartItem);

      return {
        message: 'Product quantity updated in cart',
        cartItem: existingCartItem,
      };
    }

    // Add new item to cart
    const cartItem = this.cartRepository.create({
      userId,
      productId,
      quantity,
    });

    await this.cartRepository.save(cartItem);

    const savedCartItem = await this.cartRepository.findOne({
      where: { id: cartItem.id },
      relations: ['product'],
    });

    return {
      message: 'Product added to cart successfully',
      cartItem: savedCartItem,
    };
  }

  async updateCartItem(userId: number, productId: number, quantity: number) {
    const cartItem = await this.cartRepository.findOne({
      where: { userId, productId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Product not found in cart');
    }

    cartItem.quantity = quantity;
    await this.cartRepository.save(cartItem);

    return {
      message: 'Cart updated successfully',
      cartItem,
    };
  }

  async removeFromCart(userId: number, productId: number) {
    const cartItem = await this.cartRepository.findOne({
      where: { userId, productId },
    });

    if (!cartItem) {
      throw new NotFoundException('Product not found in cart');
    }

    await this.cartRepository.remove(cartItem);

    return {
      message: 'Product removed from cart successfully',
    };
  }

  async clearCart(userId: number) {
    await this.cartRepository.delete({ userId });

    return {
      message: 'Cart cleared successfully',
    };
  }
}
