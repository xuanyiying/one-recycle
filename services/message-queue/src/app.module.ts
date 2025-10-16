import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { ClientsModule } from './clients/clients.module';
import queueConfig from './config/queue.config';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [queueConfig],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.db'),
        },
        defaultJobOptions: {
          removeOnComplete: configService.get('queue.removeOnComplete'),
          removeOnFail: configService.get('queue.removeOnFail'),
        },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    CommonModule,
    ClientsModule,
    QueueModule,
    HealthModule,
  ],
})
export class AppModule {}