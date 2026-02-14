import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface DispatchRequest {
  orderId: string;
  address: {
    province: string;
    city: string;
    district: string;
    detail: string;
    contactName: string;
    contactPhone: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  items: Array<{
    categoryId: string;
    quantity: number;
    weight?: number;
  }>;
  scheduledTime: string;
  serviceType?: 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
}

export interface DispatchResponse {
  success: boolean;
  orderId: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  waybillNo?: string;
  estimatedPickupTime?: string;
  jdOrderNo?: string;
}

@Injectable()
export class DispatchServiceClient {
  private readonly logger = new Logger(DispatchServiceClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL: string;

  constructor(private readonly configService: ConfigService) {
    this.baseURL =
      this.configService.get<string>('DISPATCH_SERVICE_URL') ||
      'http://localhost:3008';

    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30秒超时（京东API可能较慢）
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
          `Dispatch request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        this.logger.error('Dispatch request error:', error);
        return Promise.reject(error);
      },
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Dispatch response: ${response.status}`);
        return response;
      },
      (error) => {
        this.logger.error(`Dispatch error: ${error.message}`);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 自动派单（调用京东快递API）
   */
  async autoDispatch(request: DispatchRequest): Promise<DispatchResponse> {
    try {
      this.logger.log(`Auto dispatching order: ${request.orderId}`);

      const response = await this.httpClient.post<DispatchResponse>(
        '/dispatch/auto',
        request,
      );

      this.logger.log(
        `Order ${request.orderId} dispatched successfully. Waybill: ${response.data.waybillNo}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to auto dispatch order ${request.orderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * 手动派单
   */
  async manualDispatch(
    orderId: string,
    courierId: string,
  ): Promise<DispatchResponse> {
    try {
      this.logger.log(
        `Manually dispatching order ${orderId} to courier ${courierId}`,
      );

      const response = await this.httpClient.post<DispatchResponse>(
        '/dispatch/manual',
        { orderId, courierId },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to manually dispatch order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * 取消派单
   */
  async cancelDispatch(orderId: string, reason: string): Promise<boolean> {
    try {
      this.logger.log(`Cancelling dispatch for order: ${orderId}`);

      const response = await this.httpClient.post<{ success: boolean }>(
        '/dispatch/cancel',
        { orderId, reason },
      );

      return response.data.success;
    } catch (error) {
      this.logger.error(
        `Failed to cancel dispatch for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * 查询运单状态
   */
  async queryWaybillStatus(waybillNo: string): Promise<any> {
    try {
      const response = await this.httpClient.get(
        `/dispatch/waybill/${waybillNo}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to query waybill ${waybillNo}:`, error);
      throw error;
    }
  }

  /**
   * 重新分配快递员
   */
  async reassignCourier(
    orderId: string,
    oldCourierId: string,
    newCourierId: string,
    reason: string,
  ): Promise<DispatchResponse> {
    try {
      this.logger.log(
        `Reassigning order ${orderId} from ${oldCourierId} to ${newCourierId}`,
      );

      const response = await this.httpClient.post<DispatchResponse>(
        '/dispatch/reassign',
        { orderId, oldCourierId, newCourierId, reason },
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to reassign courier for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }
}
