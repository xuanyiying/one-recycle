import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { QUEUE_NAMES } from '@/common';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.ORDER },
      { name: QUEUE_NAMES.NOTIFICATION },
      { name: QUEUE_NAMES.PAYMENT },
      { name: QUEUE_NAMES.DISPATCH },
    ),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
