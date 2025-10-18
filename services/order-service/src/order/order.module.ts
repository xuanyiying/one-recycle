import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { OrderGrpcController } from './order.grpc.controller';
import { PrismaService } from '../prisma/prisma.service';
import { DispatchClientService } from '../dispatch-client.service';

@Module({
  imports: [HttpModule],
  controllers: [OrderController, OrderGrpcController],
  providers: [OrderService, PrismaService, DispatchClientService],
  exports: [OrderService],
})
export class OrderModule { }