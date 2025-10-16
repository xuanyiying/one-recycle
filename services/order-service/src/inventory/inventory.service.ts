import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface InventoryItem {
  categoryId: number;
  quantity: number;
}

export interface InventoryResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private readonly inventoryServiceUrl: string;
  private readonly httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.inventoryServiceUrl = this.configService.get<string>('INVENTORY_SERVICE_URL', 'http://localhost:3004');
    
    // Initialize HTTP client with proper configuration
    this.httpClient = axios.create({
      baseURL: this.inventoryServiceUrl,
      timeout: this.configService.get<number>('HTTP_TIMEOUT', 5000),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.log(`Making HTTP request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.log(`HTTP response received: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        this.logger.error(`HTTP error: ${error.response?.status} ${error.response?.statusText}`, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 扣减库存
   * @param categoryId 商品分类ID
   * @param quantity 扣减数量
   */
  async deductStock(categoryId: number, quantity: number): Promise<InventoryResponse> {
    try {
      this.logger.log(`扣减库存: 商品ID ${categoryId}, 数量 ${quantity}`);
      
      // 这里应该调用库存服务的API
      // 暂时模拟成功响应，实际应该发送HTTP请求到库存服务
      const response = await this.callInventoryService('POST', '/api/inventory/deduct', {
        categoryId,
        quantity
      });

      return response;
    } catch (error) {
      this.logger.error(`扣减库存失败: ${error.message}`, error.stack);
      return {
        success: false,
        message: `扣减库存失败: ${error.message}`
      };
    }
  }

  /**
   * 增加库存
   * @param categoryId 商品分类ID
   * @param quantity 增加数量
   */
  async addStock(categoryId: number, quantity: number): Promise<InventoryResponse> {
    try {
      this.logger.log(`增加库存: 商品ID ${categoryId}, 数量 ${quantity}`);
      
      // 这里应该调用库存服务的API
      // 暂时模拟成功响应，实际应该发送HTTP请求到库存服务
      const response = await this.callInventoryService('POST', '/api/inventory/add', {
        categoryId,
        quantity
      });

      return response;
    } catch (error) {
      this.logger.error(`增加库存失败: ${error.message}`, error.stack);
      return {
        success: false,
        message: `增加库存失败: ${error.message}`
      };
    }
  }

  /**
   * 检查库存是否充足
   * @param categoryId 商品分类ID
   * @param quantity 需要的数量
   */
  async checkStock(categoryId: number, quantity: number): Promise<boolean> {
    try {
      const response = await this.callInventoryService('GET', `/api/inventory/check/${categoryId}/${quantity}`);
      return response.success && response.data?.available;
    } catch (error) {
      this.logger.error(`检查库存失败: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 调用库存服务API
   * @param method HTTP方法
   * @param endpoint API端点
   * @param data 请求数据
   */
  private async callInventoryService(method: string, endpoint: string, data?: any): Promise<InventoryResponse> {
    try {
      this.logger.log(`调用库存服务: ${method} ${endpoint}`);
      
      let response: AxiosResponse;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await this.httpClient.get(endpoint);
          break;
        case 'POST':
          response = await this.httpClient.post(endpoint, data);
          break;
        case 'PUT':
          response = await this.httpClient.put(endpoint, data);
          break;
        case 'DELETE':
          response = await this.httpClient.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      // Check if response indicates success
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.data?.message || '操作成功',
          data: response.data?.data || response.data
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error(`库存服务调用失败: ${error.message}`, error.stack);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        
        throw new HttpException(
          `库存服务调用失败: ${message}`,
          status >= 400 && status < 500 ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new HttpException(
        `库存服务调用失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}