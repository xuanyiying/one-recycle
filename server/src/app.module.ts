import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// 配置
import { appConfig, databaseConfig, authConfig } from './config';

// 核心模块
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CategoryModule } from './modules/category/category.module';
import { CourierModule } from './modules/courier/courier.module';
import { SystemModule } from './modules/system/system.module';
import { AddressModule } from './modules/address/address.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { QueueModule } from './modules/queue/queue.module';
import { AccountModule } from './modules/account/account.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { FinanceModule } from './modules/finance/finance.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { StorageModule } from './modules/storage/storage.module';
import { CustomerServiceModule } from './modules/customer/customer.module';
import { CustomerUserModule } from './modules/customer/customer-user.module';

import { PointsModule } from './modules/points/points.module';
import { ContentConfigModule } from './modules/content-config/content-config.module';
import { CategoryWarehouseModule } from './modules/category-warehouse/category-warehouse.module';
import { SettingsModule } from './modules/settings/settings.module';

// 健康检查模块
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // 全局配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig],
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),

    // 速率限制模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60000),
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
      inject: [ConfigService],
    }),

    // 核心模块
    CacheModule.register({ isGlobal: true }),
    PrismaModule,
    RedisModule,

    // 健康检查
    HealthModule,

    // 业务模块
    AuthModule,
    UserModule,
    OrderModule,
    PaymentModule,
    CategoryModule,
    CourierModule,
    SystemModule,
    AddressModule,
    InventoryModule,
    NotificationModule,
    DispatchModule,
    QueueModule,
    RankingModule,
    AccountModule,
    LogisticsModule,
    FinanceModule,
    TenantModule,
    PricingModule,
    StorageModule,
    CustomerServiceModule,
    CustomerUserModule,
    PointsModule,
    ContentConfigModule,
    CategoryWarehouseModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局启用 JwtAuthGuard，所有接口默认需要认证
    // 使用 @Public() 装饰器标记不需要认证的公开接口
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // 全局启用 ThrottlerGuard，所有限流默认生效
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
