import { Module } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { JdlLogisticsService } from './providers/jd-provider';

@Module({
  imports: [PrismaModule],
  controllers: [LogisticsController],
  providers: [LogisticsService, JdlLogisticsService],
  exports: [LogisticsService, JdlLogisticsService],
})
export class LogisticsModule {}
