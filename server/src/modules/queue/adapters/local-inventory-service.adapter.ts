import { Injectable, Logger } from '@nestjs/common';
import { InventoryService } from '@/modules/inventory/services/inventory.service';
import {
  IInventoryService,
  InventoryCheckRequest,
  InventoryCheckResponse,
  InventoryLockRequest,
} from '../interfaces/inventory-service.interface';

@Injectable()
export class LocalInventoryServiceAdapter implements IInventoryService {
  private readonly logger = new Logger(LocalInventoryServiceAdapter.name);

  constructor(private readonly inventoryService: InventoryService) {}

  async checkInventory(
    request: InventoryCheckRequest,
  ): Promise<InventoryCheckResponse> {
    this.logger.debug('Checking inventory locally');

    const results: InventoryCheckResponse['items'] = [];
    let allAvailable = true;

    for (const item of request.items) {
      const inventoryItems = await this.inventoryService.getInventoryItems(
        { categoryId: BigInt(item.categoryId) },
        undefined,
        { page: 1, pageSize: 1 },
      );
      const available = inventoryItems.total > 0;
      if (!available) allAvailable = false;
      results.push({
        categoryId: item.categoryId,
        available,
        availableQuantity: available ? 999 : 0,
        requestedQuantity: item.quantity,
      });
    }

    return { available: allAvailable, items: results };
  }

  async lockInventory(request: InventoryLockRequest): Promise<boolean> {
    this.logger.debug(`Locking inventory for order ${request.orderId}`);

    try {
      for (const item of request.items) {
        // Find an available inventory item for this category
        const searchResult = await this.inventoryService.getInventoryItems(
          { categoryId: BigInt(item.categoryId) },
          undefined,
          { page: 1, pageSize: 1 },
        );

        if (searchResult.total === 0 || !searchResult.items[0]) {
          this.logger.warn(
            `No inventory item found for category ${item.categoryId}`,
          );
          return false;
        }

        const inventoryItem = searchResult.items[0];

        await this.inventoryService.createReservation({
          itemId: BigInt(inventoryItem.id),
          orderId: request.orderId,
          quantity: item.quantity,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
          notes: `Reserved for order ${request.orderId}`,
        });
      }

      this.logger.log(`Inventory locked for order ${request.orderId}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to lock inventory for order ${request.orderId}`,
        error,
      );
      return false;
    }
  }

  async releaseInventory(orderId: string): Promise<boolean> {
    this.logger.debug(`Releasing inventory for order ${orderId}`);

    try {
      // Find reservations for this order and cancel them
      const { prisma } = this.inventoryService as any;
      if (!prisma) {
        this.logger.warn('Prisma not available, skipping release');
        return true;
      }

      const reservations = await prisma.reservation.findMany({
        where: {
          orderId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      for (const reservation of reservations) {
        await this.inventoryService.cancelReservation(BigInt(reservation.id));
      }

      this.logger.log(
        `Released ${reservations.length} reservations for order ${orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to release inventory for order ${orderId}`,
        error,
      );
      return false;
    }
  }
}
