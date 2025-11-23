import { Injectable } from '@nestjs/common';

@Injectable()
export class DispatchServiceClient {
  async assignOrder(orderId: string): Promise<void> {
    // 在单体应用中，这将直接调用OrderService中的DispatchClientService
    console.log(`Assigning order ${orderId}`);
  }

  async cancelAssignment(orderId: string): Promise<void> {
    // 在单体应用中，这将直接调用OrderService中的DispatchClientService
    console.log(`Cancelling assignment for order ${orderId}`);
  }

  async cancelDispatch(orderId: string, reason?: string): Promise<void> {
    console.log(`Cancelling dispatch for order ${orderId}, reason: ${reason}`);
  }

  async autoDispatch(data: any): Promise<{ success: boolean; courierId?: string; waybillNo?: string; jdOrderNo?: string }> {
    console.log(`Auto dispatch:`, data);
    return { success: true, courierId: 'courier-001', waybillNo: 'WB123', jdOrderNo: 'JD123' };
  }
}
