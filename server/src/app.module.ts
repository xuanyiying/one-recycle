import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
