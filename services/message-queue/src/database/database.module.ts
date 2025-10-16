import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JobStatusRepository } from './repositories/job-status.repository';
import { DeadLetterQueueRepository } from './repositories/dead-letter-queue.repository';
import { PaymentLogRepository } from './repositories/payment-log.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    JobStatusRepository,
    DeadLetterQueueRepository,
    PaymentLogRepository,
  ],
  exports: [
    PrismaService,
    JobStatusRepository,
    DeadLetterQueueRepository,
    PaymentLogRepository,
  ],
})
export class DatabaseModule {}