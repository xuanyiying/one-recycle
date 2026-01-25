import { Module } from '@nestjs/common';
import { CategoryController } from './controllers';
import { CategoryService } from './services';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
