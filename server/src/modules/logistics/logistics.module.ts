import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { LogisticsIntegrationService } from './logistics-integration.service';
import { LogisticsProviderFactory } from './providers/logistics-provider.factory';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [LogisticsController],
  providers: [
    LogisticsService,
    LogisticsProviderFactory,
    LogisticsIntegrationService,
  ],
  exports: [
    LogisticsService,
    LogisticsIntegrationService,
    LogisticsProviderFactory,
  ],
})
export class LogisticsModule {}
