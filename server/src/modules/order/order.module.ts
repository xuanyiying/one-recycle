import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { OrderGrpcController } from './order.grpc.controller';
import { PrismaModule } from '../../prisma/prisma.module';
@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [OrderController, OrderGrpcController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule { }