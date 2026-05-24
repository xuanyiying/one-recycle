import { OrderStatus } from '@/common/types/business.types';
import { OrderService } from '@/modules/order/services/order.service';
import { Injectable, Logger } from '@nestjs/common';
import { IOrderService, Order } from '../interfaces/order-service.interface';

@Injectable()
export class LocalOrderServiceAdapter implements IOrderService {
  private readonly logger = new Logger(LocalOrderServiceAdapter.name);

  constructor(private readonly orderService: OrderService) { }

  async getOrder(orderId: string): Promise<Order> {
    this.logger.debug(`Getting order ${orderId} from local service`);
    const order = await this.orderService.findById(BigInt(orderId));
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    return this.mapToInterface(order);
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    metadata?: Record<string, any>,
  ): Promise<Order> {
    this.logger.debug(
      `Updating order ${orderId} status to ${status} locally`,
    );
    const updatedOrder = await this.orderService.updateStatus(BigInt(orderId), {
      status: status as any,
      ...metadata,
    });
    return this.mapToInterface(updatedOrder);
  }

  async updateOrderAmount(orderId: string, totalAmount: number): Promise<Order> {
    this.logger.debug(`Updating order ${orderId} amount to ${totalAmount}`);
    const updatedOrder = await this.orderService.updateOrderAmount(
      BigInt(orderId),
      totalAmount,
    );
    return this.mapToInterface(updatedOrder);
  }

  private mapToInterface(order: any): Order {
    const addressData = order.address;
    return {
      id: order.id.toString(),
      userId: order.userId?.toString(),
      status: order.status,
      orderType: order.orderType,
      items: (order.items || []).map((item: any) => ({
        id: item.id.toString(),
        categoryId: item.categoryId?.toString(),
        quantity: item.quantity,
        estimatedPrice: Number(item.estimatedPrice) || 0,
        actualPrice: item.actualPrice ? Number(item.actualPrice) : undefined,
        description: item.description,
      })),
      address: {
        id: addressData?.id?.toString(),
        fullAddress: addressData?.fullAddress || addressData?.detail || '',
        province: addressData?.province,
        city: addressData?.city,
        district: addressData?.district,
        detail: addressData?.detail,
        coordinates: addressData?.coordinates
          ? {
            lat: Number(addressData.coordinates.lat),
            lng: Number(addressData.coordinates.lng),
          }
          : undefined,
        contactName: addressData?.contactName,
        contactPhone: addressData?.contactPhone,
      },
      totalAmount: Number(order.totalAmount) || Number(order.estimatedAmount) || 0,
      scheduledTime: order.expectPickupTime,
      courierId: order.courierId,
      waybillNo: order.waybillNo,
    };
  }
}
