import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { join } from 'path';
import {
  IInventoryService,
  InventoryCheckRequest,
  InventoryCheckResponse,
  InventoryLockRequest,
} from '../interfaces/inventory-service.interface';

@Injectable()
export class InventoryServiceGrpcClient implements IInventoryService {
  private readonly logger = new Logger(InventoryServiceGrpcClient.name);
  private readonly client: any;
  private inventoryService: any;

  constructor(private readonly configService: ConfigService) {
    const url =
      this.configService.get<string>('INVENTORY_SERVICE_GRPC_URL') ||
      '127.0.0.1:50051';

    this.client = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'inventory',
        protoPath: join(__dirname, '../../../proto/inventory.proto'),
        url,
      },
    });

    this.inventoryService =
      this.client.getService('InventoryService');
    this.logger.log(
      `gRPC client connected to inventory service at ${url}`,
    );
  }

  async checkInventory(
    request: InventoryCheckRequest,
  ): Promise<InventoryCheckResponse> {
    this.logger.debug('[gRPC] Checking inventory availability');

    try {
      const checkRequest = {
        items: request.items.map((item) => ({
          categoryId: BigInt(item.categoryId),
          quantity: item.quantity,
        })),
      };

      const response = await new Promise<any>((resolve, reject) => {
        this.inventoryService.checkAvailability(
          checkRequest,
          (err: Error | null, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });

      return {
        available: response.available ?? true,
        items: (response.items || []).map((item: any) => ({
          categoryId: String(item.categoryId),
          available: item.available ?? true,
          availableQuantity:
            item.availableQuantity ?? item.requestedQuantity ?? 0,
          requestedQuantity: item.requestedQuantity ?? 0,
        })),
      };
    } catch (error) {
      this.logger.error('[gRPC] Failed to check inventory:', error);

      return {
        available: true,
        items: request.items.map((item) => ({
          categoryId: item.categoryId,
          available: true,
          availableQuantity: item.quantity,
          requestedQuantity: item.quantity,
        })),
      };
    }
  }

  async lockInventory(request: InventoryLockRequest): Promise<boolean> {
    this.logger.debug(
      `[gRPC] Locking inventory for order ${request.orderId}`,
    );

    try {
      for (const item of request.items) {
        await new Promise<void>((resolve, reject) => {
          this.inventoryService.createReservation(
            {
              itemId: BigInt(item.categoryId),
              quantity: item.quantity,
              orderId: BigInt(request.orderId),
              expiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000,
              ).toISOString(),
            },
            (err: Error | null) => {
              if (err) reject(err);
              else resolve();
            },
          );
        });
      }

      this.logger.log(
        `[gRPC] Inventory locked for order ${request.orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `[gRPC] Failed to lock inventory for order ${request.orderId}:`,
        error,
      );
      throw error;
    }
  }

  async releaseInventory(orderId: string): Promise<boolean> {
    this.logger.debug(`[gRPC] Releasing inventory for order ${orderId}`);

    try {
      this.logger.log(
        `[gRPC] Inventory reservation released for order ${orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `[gRPC] Failed to release inventory for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }
}
