import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CategoryWarehouseController } from './category-warehouse.controller';
import { CategoryWarehouseService } from './category-warehouse.service';

/**
 * 分类仓库关联模块
 *
 * 管理分类与仓库的关联关系，包括：
 * - 分类的仓库分配
 * - 仓库分类配置
 * - 分类库存管理
 *
 * @module CategoryWarehouseModule
 */
@Module({
  imports: [PrismaModule],
  controllers: [CategoryWarehouseController],
  providers: [CategoryWarehouseService],
  exports: [CategoryWarehouseService],
})
export class CategoryWarehouseModule {}
