import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { OrderStatus } from '@/common/types/business.types';

export type RemoteOrderStatus = OrderStatus;

export interface Order {
  id: string;
  userId: string;
  status: RemoteOrderStatus | string;
  orderType?: string;
  items: OrderItem[];
  address: Address;
  totalAmount: number;
  scheduledTime: string;
  courierId?: string;
  waybillNo?: string;
}

export interface OrderItem {
  id: string;
  categoryId: string;
  quantity: number;
  estimatedPrice: number;
  actualPrice?: number;
  description?: string;
}

export interface Address {
  id: string;
  fullAddress: string;
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactName?: string;
  contactPhone?: string;
}

@Injectable()
export class OrderServiceClient {
  private readonly logger = new Logger(OrderServiceClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL: string;

  constructor(private readonly configService: ConfigService) {
    this.baseURL =
      this.configService.get<string>('ORDER_SERVICE_URL') ||
      'http://localhost:3008';

    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `Response: ${response.status} ${response.config.url}`,
        );
        return response;
      },
      (error) => {
        this.logger.error(`Response error: ${error.message}`);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 获取订单详情
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await this.httpClient.get<Order>(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(
    orderId: string,
    status: RemoteOrderStatus,
    metadata?: Record<string, any>,
  ): Promise<Order> {
    try {
      const response = await this.httpClient.put<Order>(
        `/orders/${orderId}/status`,
        {
          status,
          ...metadata,
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update order status ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * 更新订单总价
   */
  async updateOrderAmount(
    orderId: string,
    totalAmount: number,
  ): Promise<Order> {
    try {
      const response = await this.httpClient.patch<Order>(
        `/orders/${orderId}`,
        {
          totalAmount,
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update order amount ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * 分配快递员
   */
  async assignCourier(
    orderId: string,
    courierId: string,
    waybillNo?: string,
  ): Promise<Order> {
    try {
      const response = await this.httpClient.patch<Order>(
        `/orders/${orderId}/assign`,
        {
          courierId,
          waybillNo,
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to assign courier to order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    try {
      const response = await this.httpClient.post<Order>(
        `/orders/${orderId}/cancel`,
        {
          reason,
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to cancel order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * 检查订单是否已支付
   */
  async isOrderPaid(orderId: string): Promise<boolean> {
    try {
      const order = await this.getOrder(orderId);
      return (
        order.status !== OrderStatus.PENDING &&
        order.status !== OrderStatus.CANCELLED
      );
    } catch (error) {
      this.logger.error(
        `Failed to check payment status for order ${orderId}:`,
        error,
      );
      return false;
    }
  }
}
