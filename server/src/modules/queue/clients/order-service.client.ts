import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderServiceClient {
  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    // 在单体应用中，这将直接调用OrderService
    console.log(`Updating order ${orderId} status to ${status}`);
  }

  async updateOrderAmount(orderId: string, amount: number): Promise<void> {
    // 在单体应用中，这将直接调用OrderService
    console.log(`Updating order ${orderId} amount to ${amount}`);
  }

  async getOrder(orderId: string): Promise<any> {
    console.log(`Fetching order ${orderId}`);
    return { id: orderId, status: 'PENDING', address: {}, items: [], userId: '0' };
  }

  async assignCourier(orderId: string, courierId: string, waybillNo?: string): Promise<void> {
    console.log(`Assign courier ${courierId} for order ${orderId} with waybill ${waybillNo}`);
  }
}
