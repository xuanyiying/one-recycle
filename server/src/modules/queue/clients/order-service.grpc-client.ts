import { OrderStatus } from '@/common/types/business.types';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { join } from 'path';
import { IOrderService, Order } from '../interfaces/order-service.interface';

@Injectable()
export class OrderServiceGrpcClient implements IOrderService {
  private readonly logger = new Logger(OrderServiceGrpcClient.name);
  private readonly client: any;
  private orderService: any;

  constructor(private readonly configService: ConfigService) {
    const url =
      this.configService.get<string>('ORDER_SERVICE_GRPC_URL') ||
      '127.0.0.1:50051';

    this.client = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'order',
        protoPath: join(__dirname, '../../../proto/order.proto'),
        url,
      },
    });

    this.orderService = this.client.getService('OrderService');
    this.logger.log(`gRPC client connected to order service at ${url}`);
  }

  async getOrder(orderId: string): Promise<Order> {
    this.logger.debug(`[gRPC] Getting order ${orderId}`);

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.orderService.getOrder({ orderId }, (err: Error | null, res: any) => {
          if (err) reject(err);
          else resolve(res);
        });
      });

      if (!response?.order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      return this.mapFromGrpc(response.order);
    } catch (error) {
      this.logger.error(`[gRPC] Failed to get order ${orderId}:`, error);
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    metadata?: Record<string, any>,
  ): Promise<Order> {
    this.logger.debug(
      `[gRPC] Updating order ${orderId} status to ${status}`,
    );

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.orderService.updateOrder(
          {
            orderId,
            status: status as string,
            remark: metadata?.reason || '',
          },
          (err: Error | null, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });

      if (!response?.order) {
        throw new Error(`Failed to update order status: ${orderId}`);
      }

      return this.mapFromGrpc(response.order);
    } catch (error) {
      this.logger.error(
        `[gRPC] Failed to update order ${orderId} status:`,
        error,
      );
      throw error;
    }
  }

  async updateOrderAmount(orderId: string, totalAmount: number): Promise<Order> {
    this.logger.debug(
      `[gRPC] Updating order ${orderId} amount to ${totalAmount}`,
    );

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.orderService.updateOrder(
          {
            orderId,
            status: '',
            remark: JSON.stringify({ totalAmount }),
          },
          (err: Error | null, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });

      if (!response?.order) {
        throw new Error(`Failed to update order amount: ${orderId}`);
      }

      return this.mapFromGrpc(response.order);
    } catch (error) {
      this.logger.error(
        `[gRPC] Failed to update order ${orderId} amount:`,
        error,
      );
      throw error;
    }
  }

  private mapFromGrpc(order: any): Order {
    return {
      id: order.id?.toString() || '',
      userId: order.userId?.toString() || '',
      status: order.status as OrderStatus,
      orderType: order.orderType,
      items: (order.items || []).map((item: any) => ({
        id: item.id?.toString(),
        categoryId: item.categoryId?.toString(),
        quantity: item.quantity || 1,
        estimatedPrice: Number(item.unitPrice) || Number(item.amount) || 0,
        actualPrice: item.actualWeight ? Number(item.amount) : undefined,
        description: '',
      })),
      address: {
        id: order.addressId?.toString(),
        fullAddress: '',
        detail: '',
      },
      totalAmount:
        Number(order.settlementAmount) ||
        Number(order.estimatedAmount) ||
        0,
      scheduledTime: order.expectPickupTime,
      courierId: order.assignments?.[0]?.courierId,
      waybillNo: undefined,
    };
  }
}
