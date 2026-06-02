export interface IInventoryService {
  checkInventory(
    request: InventoryCheckRequest,
  ): Promise<InventoryCheckResponse>;
  lockInventory(request: InventoryLockRequest): Promise<boolean>;
  releaseInventory(orderId: string): Promise<boolean>;
}

export interface InventoryCheckRequest {
  items: Array<{
    categoryId: string;
    quantity: number;
  }>;
}

export interface InventoryCheckResponse {
  available: boolean;
  items: Array<{
    categoryId: string;
    available: boolean;
    availableQuantity: number;
    requestedQuantity: number;
  }>;
}

export interface InventoryLockRequest {
  orderId: string;
  items: Array<{
    categoryId: string;
    quantity: number;
  }>;
}
