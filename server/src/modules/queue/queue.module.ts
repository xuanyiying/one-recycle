import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrderQueueService } from './services/order-queue.service';
import { NotificationQueueService } from './services/notification-queue.service';
import { PaymentQueueService } from './services/payment-queue.service';
import { DispatchQueueService } from './services/dispatch-queue.service';
import { OrderProcessor } from './processors/order.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { PaymentProcessor } from './processors/payment.processor';
import { QueueController } from './queue.controller';
import { QueueGrpcController } from './queue.grpc.controller';

// Client services for processors
import { OrderServiceClient } from './clients/order-service.client';
import { InventoryServiceClient } from './clients/inventory-service.client';
import { DispatchServiceClient } from './clients/dispatch-service.client';
import { PaymentServiceClient } from './clients/payment-service.client';

// Module imports for processors
import { OrderModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';
import { NotificationModule } from '../notification/notification.module';
import { QUEUE_NAMES } from '@/common';

@Module({
  imports: [
    // Use forwardRef to prevent circular dependencies
    forwardRef(() => OrderModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => NotificationModule),
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
  controllers: [QueueController, QueueGrpcController],
  providers: [
    // Client services for processors
    OrderServiceClient,
    InventoryServiceClient,
    DispatchServiceClient,
    PaymentServiceClient,
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
