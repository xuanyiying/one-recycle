import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { OrderGrpcController } from './order.grpc.controller';
import { PrismaService } from '../prisma.service';
import { DispatchClientService } from '../dispatch-client.service';
import { InventoryService } from '../inventory/inventory.service';

@Module({
  controllers: [OrderController, OrderGrpcController],
  providers: [OrderService, PrismaService, DispatchClientService, InventoryService],
  exports: [OrderService],
})
export class OrderModule { }