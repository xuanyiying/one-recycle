import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrderQueueService } from './services/order-queue.service';
import { NotificationQueueService } from './services/notification-queue.service';
import { PaymentQueueService } from './services/payment-queue.service';
import { DispatchQueueService } from './services/dispatch-queue.service';
import { OrderProcessor } from './processors/order.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { PaymentProcessor } from './processors/payment.processor';
import { QueueController } from './queue.controller';
import { QUEUE_NAMES } from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.ORDER },
      {
        name: QUEUE_NAMES.NOTIFICATION,
        limiter: {
          max: 100, // 每分钟最多100条
          duration: 60000,
        },
      },
      { name: QUEUE_NAMES.PAYMENT },
      { name: QUEUE_NAMES.DISPATCH },
    ),
  ],
  controllers: [QueueController],
  providers: [
    // Queue Services (Producers)
    OrderQueueService,
    NotificationQueueService,
    PaymentQueueService,
    DispatchQueueService,
    // Processors (Consumers)
    OrderProcessor,
    NotificationProcessor,
    PaymentProcessor,
  ],
  exports: [
    OrderQueueService,
    NotificationQueueService,
    PaymentQueueService,
    DispatchQueueService,
  ],
})
export class QueueModule {}

export { QUEUE_NAMES };
