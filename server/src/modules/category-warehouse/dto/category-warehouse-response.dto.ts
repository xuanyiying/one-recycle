export class CategoryWarehouseResponseDto {
  id!: number;
  categoryId!: number;
  categoryName!: string;
  warehouseId!: number;
  warehouseName!: string;
  warehouseAddress!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
