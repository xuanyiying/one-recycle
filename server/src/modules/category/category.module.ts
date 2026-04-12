import { Module } from '@nestjs/common';
import { CategoryController } from './controllers';
import { CategoryGrpcController } from './controllers/category.grpc.controller';
import { CategoryService } from './services';
import { PrismaModule } from '../../prisma/prisma.module';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PrismaModule, PricingModule],
  controllers: [CategoryController, CategoryGrpcController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
