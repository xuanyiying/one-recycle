import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CategoryWarehouseController } from './category-warehouse.controller';
import { CategoryWarehouseService } from './category-warehouse.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryWarehouseController],
  providers: [CategoryWarehouseService],
  exports: [CategoryWarehouseService],
})
export class CategoryWarehouseModule { }
