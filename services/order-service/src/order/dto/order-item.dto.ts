import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class OrderItemDto {
  @IsInt()
  categoryId!: number;

  @IsNumber()
  @Min(0)
  estimatedWeight!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}