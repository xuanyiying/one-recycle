import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { NotificationGrpcController } from './notification.grpc.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@/common/redis/redis.module';

@Module({
  imports: [PrismaModule, ConfigModule, RedisModule],
  controllers: [NotificationController, NotificationGrpcController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
