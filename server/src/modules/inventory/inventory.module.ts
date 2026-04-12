import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryGrpcController } from './inventory.grpc.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { InventoryService } from './services/inventory.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [InventoryController, InventoryGrpcController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
