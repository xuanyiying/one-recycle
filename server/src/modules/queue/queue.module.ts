import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DispatchProcessor } from './processors/dispatch.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { OrderProcessor } from './processors/order.processor';
import { PaymentProcessor } from './processors/payment.processor';
import { QueueController } from './queue.controller';
import { QueueGrpcController } from './queue.grpc.controller';
import { DeadLetterQueueService } from './services/dead-letter-queue.service';
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

/**
 * 队列处理模块
 *
 * 基于Bull队列的任务处理系统，支持：
 * - 订单队列处理（状态流转、超时处理）
 * - 通知队列处理（短信、邮件、推送）
 * - 支付队列处理（支付回调、退款）
 * - 调度队列处理（快递员分配、路线优化）
 *
 * 使用Redis作为消息队列后端，支持分布式部署
 *
 * @module QueueModule
 */
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
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          db: configService.get<number>('REDIS_DB', 0),
        },
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      }),
      inject: [ConfigService],
    }),
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
    DeadLetterQueueService,
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
    DeadLetterQueueService,
    OrderQueueService,
    NotificationQueueService,
    PaymentQueueService,
    DispatchQueueService,
  ],
})
export class QueueModule {}
