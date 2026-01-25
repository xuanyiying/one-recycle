import { Injectable } from '@nestjs/common';

@Injectable()
export class DispatchClientService {
  // 这是一个模拟的派单客户端服务
  // 在实际的微服务架构中，这里会调用派单服务的API

  async assignOrder(orderId: number): Promise<any> {
    // 模拟派单逻辑
    console.log(`Assigning order ${orderId} to courier`);
    return {
      orderId,
      status: 'ASSIGNED',
      assignedAt: new Date(),
    };
  }

  async cancelAssignment(orderId: number): Promise<any> {
    // 模拟取消派单逻辑
    console.log(`Cancelling assignment for order ${orderId}`);
    return {
      orderId,
      status: 'CANCELLED',
      cancelledAt: new Date(),
    };
  }
}
