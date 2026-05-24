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

// Local adapters (Monolithic mode - development)
import {
  LocalDispatchServiceAdapter,
  LocalInventoryServiceAdapter,
  LocalOrderServiceAdapter,
  LocalPaymentServiceAdapter,
} from './adapters';

// gRPC clients (Microservices mode - production)
import {
  DispatchServiceGrpcClient,
  InventoryServiceGrpcClient,
  OrderServiceGrpcClient,
  PaymentServiceGrpcClient,
} from './clients';

// Local services (for monolithic mode)
import { AccountService } from '@/modules/account/account.service';
import { DispatchService } from '@/modules/dispatch/dispatch.service';
import { InventoryService } from '@/modules/inventory/services/inventory.service';
import { OrderService } from '@/modules/order/services/order.service';

// Module imports for processors
import { QUEUE_NAMES, RedisModule } from '@/common';
import { AccountModule } from '../account/account.module';
import { DispatchModule } from '../dispatch/dispatch.module';
import { InventoryModule } from '../inventory/inventory.module';
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
    // Required for local adapters (monolithic mode)
    InventoryModule,
    DispatchModule,
    AccountModule,
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

    // === Service Abstraction Layer ===
    // Three-tier strategy:
    //   1. Monolithic (dev):  → Local Adapter → direct service call
    //   2. Microservice (prod):→ gRPC Client → proto-defined RPC

    {
      provide: 'IOrderService',
      useFactory: (
        orderService: OrderService,
        configService: ConfigService,
      ) => {
        const serviceMode = configService.get<string>(
          'SERVICE_MODE',
          'monolithic',
        );

        if (serviceMode === 'microservices') {
          return new OrderServiceGrpcClient(configService);
        }
        return new LocalOrderServiceAdapter(orderService);
      },
      inject: [OrderService, ConfigService],
    },

    {
      provide: 'IPaymentService',
      useFactory: (
        accountService: AccountService,
        configService: ConfigService,
      ) => {
        const serviceMode = configService.get<string>(
          'SERVICE_MODE',
          'monolithic',
        );

        if (serviceMode === 'microservices') {
          return new PaymentServiceGrpcClient(configService);
        }
        return new LocalPaymentServiceAdapter(accountService);
      },
      inject: [AccountService, ConfigService],
    },

    {
      provide: 'IInventoryService',
      useFactory: (
        inventoryService: InventoryService,
        configService: ConfigService,
      ) => {
        const serviceMode = configService.get<string>(
          'SERVICE_MODE',
          'monolithic',
        );

        if (serviceMode === 'microservices') {
          return new InventoryServiceGrpcClient(configService);
        }
        return new LocalInventoryServiceAdapter(inventoryService);
      },
      inject: [InventoryService, ConfigService],
    },

    {
      provide: 'IDispatchService',
      useFactory: (
        dispatchService: DispatchService,
        configService: ConfigService,
      ) => {
        const serviceMode = configService.get<string>(
          'SERVICE_MODE',
          'monolithic',
        );

        if (serviceMode === 'microservices') {
          return new DispatchServiceGrpcClient(configService);
        }
        return new LocalDispatchServiceAdapter(dispatchService);
      },
      inject: [DispatchService, ConfigService],
    },

    // gRPC clients are NOT registered as direct providers to avoid
    // connection attempts in monolithic mode. They are only instantiated
    // inside the factory providers when SERVICE_MODE=microservices.

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
export class QueueModule { }
