import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressGrpcController } from './address.grpc.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@/common/redis/redis.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, RedisModule, ConfigModule],
  controllers: [AddressController, AddressGrpcController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
