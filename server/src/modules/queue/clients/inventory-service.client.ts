import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

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

@Injectable()
export class InventoryServiceClient {
  private readonly logger = new Logger(InventoryServiceClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL: string;

  constructor(private readonly configService: ConfigService) {
    this.baseURL =
      this.configService.get<string>('INVENTORY_SERVICE_URL') ||
      'http://localhost:3009';

    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `Inventory request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`Inventory error: ${error.message}`);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 检查库存是否充足
   */
  async checkInventory(
    request: InventoryCheckRequest,
  ): Promise<InventoryCheckResponse> {
    try {
      const response = await this.httpClient.post<InventoryCheckResponse>(
        '/inventory/check',
        request,
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to check inventory:', error);
      throw error;
    }
  }

  /**
   * 锁定库存
   */
  async lockInventory(request: InventoryLockRequest): Promise<boolean> {
    try {
      const response = await this.httpClient.post<{ success: boolean }>(
        '/inventory/lock',
        request,
      );

      return response.data.success;
    } catch (error) {
      this.logger.error(
        `Failed to lock inventory for order ${request.orderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * 释放库存
   */
  async releaseInventory(orderId: string): Promise<boolean> {
    try {
      const response = await this.httpClient.post<{ success: boolean }>(
        '/inventory/release',
        { orderId },
      );

      return response.data.success;
    } catch (error) {
      this.logger.error(
        `Failed to release inventory for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * 扣减库存（订单完成后）
   */
  async deductInventory(orderId: string): Promise<boolean> {
    try {
      const response = await this.httpClient.post<{ success: boolean }>(
        '/inventory/deduct',
        { orderId },
      );

      return response.data.success;
    } catch (error) {
      this.logger.error(
        `Failed to deduct inventory for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }
}
