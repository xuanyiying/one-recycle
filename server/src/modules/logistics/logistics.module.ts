import { Module } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { JdlLogisticsService } from './providers/jd-provider';
import { LogisticsIntegrationService } from './logistics-integration.service';

@Module({
  imports: [PrismaModule],
  controllers: [LogisticsController],
  providers: [
    LogisticsService,
    JdlLogisticsService,
    LogisticsIntegrationService,
  ],
  exports: [LogisticsService, JdlLogisticsService, LogisticsIntegrationService],
})
export class LogisticsModule {}
