import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderQueueService } from './services/order-queue.service';
import { NotificationQueueService } from './services/notification-queue.service';
import { PaymentQueueService } from './services/payment-queue.service';
import { DispatchQueueService } from './services/dispatch-queue.service';
import { OrderProcessor } from './processors/order.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { PaymentProcessor } from './processors/payment.processor';
import { DispatchProcessor } from './processors/dispatch.processor';
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
import { LogisticsModule } from '../logistics/logistics.module';
import { TenantModule } from '../tenant/tenant.module';
import { QUEUE_NAMES, RedisModule } from '@/common';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    // Use forwardRef to prevent circular dependencies
    forwardRef(() => OrderModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => NotificationModule),
    LogisticsModule,
    TenantModule,
    BullModule.registerQueueAsync(
      { name: QUEUE_NAMES.ORDER },
      {
        name: QUEUE_NAMES.NOTIFICATION,
        useFactory: (configService: ConfigService) => ({
          limiter: {
            max: configService.get<number>('NOTIFICATION_QUEUE_LIMIT_MAX', 100),
            duration: configService.get<number>(
              'NOTIFICATION_QUEUE_LIMIT_DURATION',
              60000,
            ),
          },
        }),
        inject: [ConfigService],
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
    DispatchProcessor,
  ],
  exports: [
    OrderQueueService,
    NotificationQueueService,
    PaymentQueueService,
    DispatchQueueService,
  ],
})
export class QueueModule {}
