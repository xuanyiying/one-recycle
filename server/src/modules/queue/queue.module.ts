import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DispatchProcessor } from './processors/dispatch.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { OrderProcessor } from './processors/order.processor';
import { PaymentProcessor } from './processors/payment.processor';
import { QueueController } from './queue.controller';
import { QueueGrpcController } from './queue.grpc.controller';
import { DispatchQueueService } from './services/dispatch-queue.service';
import { NotificationQueueService } from './services/notification-queue.service';
import { OrderQueueService } from './services/order-queue.service';
import { PaymentQueueService } from './services/payment-queue.service';

// Client services for processors
import { DispatchServiceClient } from './clients/dispatch-service.client';
import { InventoryServiceClient } from './clients/inventory-service.client';
import { OrderServiceClient } from './clients/order-service.client';
import { PaymentServiceClient } from './clients/payment-service.client';

// Module imports for processors
import { QUEUE_NAMES, RedisModule } from '@/common';
import { LogisticsModule } from '../logistics/logistics.module';
import { NotificationModule } from '../notification/notification.module';
import { OrderModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';
import { PointsModule } from '../points/points.module';
import { PricingModule } from '../pricing/pricing.module';
import { TenantModule } from '../tenant/tenant.module';

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
    PricingModule,
    PointsModule,
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
export class QueueModule { }
