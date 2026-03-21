import { Module } from '@nestjs/common';
import { CategoryWarehouseService } from './category-warehouse.service';
import { CategoryWarehouseController } from './category-warehouse.controller';

@Module({
  controllers: [CategoryWarehouseController],
  providers: [CategoryWarehouseService],
  exports: [CategoryWarehouseService],
})
export class CategoryWarehouseModule {}
