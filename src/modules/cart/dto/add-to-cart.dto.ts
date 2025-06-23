import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({ example: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsPositive()
  productId: number;

  @ApiProperty({ example: 2 })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}
