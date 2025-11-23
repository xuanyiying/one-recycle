import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryServiceClient {
  async checkInventory(data: any): Promise<{ available: boolean }> {
    // 在单体应用中，这将直接调用InventoryService
    console.log(`Checking inventory:`, data);
    return { available: true };
  }

  async lockInventory(data: any): Promise<void> {
    // 在单体应用中，这将直接调用InventoryService
    console.log(`Locking inventory:`, data);
  }

  async releaseInventory(orderId: string): Promise<void> {
    // 在单体应用中，这将直接调用InventoryService
    console.log(`Releasing inventory for order ${orderId}`);
  }
}