import { Module } from '@nestjs/common';
import { ContentConfigController } from './content-config.controller';
import { ContentConfigService } from './content-config.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContentConfigController],
  providers: [ContentConfigService],
  exports: [ContentConfigService],
})
export class ContentConfigModule {}
