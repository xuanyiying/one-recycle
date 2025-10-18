import { Module } from '@nestjs/common';
import { CategoryModule } from './modules/category/category.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [CategoryModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}