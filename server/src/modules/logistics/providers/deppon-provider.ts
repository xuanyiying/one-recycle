import { Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as crypto from 'crypto';
import {
  DepponResponse,
  DepponPrecheckDto,
  DepponPrecheckResult,
  DepponCreateOrderDto,
  DepponCreateOrderResult,
  DepponSubscribeTraceDto,
  DepponQueryTraceDto,
  DepponQueryTraceResult,
  DepponModifyOrderDto,
  DepponCancelOrderDto,
  DepponQueryStatusDto,
  DepponQueryStatusResult,
  DepponQueryFeeDto,
  DepponQueryFeeResult,
} from '../dto/deppon.dto';
import {
  ILogisticsProvider,
  LogisticsProviderConfig,
} from './logistics-provider.interface';

export class DepponLogisticsProvider implements ILogisticsProvider {
  readonly code = 'DEPPON';
  readonly name = '德邦快递';
  private readonly logger = new Logger(DepponLogisticsProvider.name);
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly config: LogisticsProviderConfig) {
    this.axiosInstance = axios.create({
      baseURL: this.config.apiUrl || 'https://api.deppon.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });

    // Logging Interceptor
    this.axiosInstance.interceptors.request.use((req) => {
      this.logger.debug(
        `Deppon Request: ${req.method?.toUpperCase()} ${req.url}`,
      );
      return req;
    });
    this.axiosInstance.interceptors.response.use(
      (res) => {
        this.logger.debug(`Deppon Response: ${JSON.stringify(res.data)}`);
        return res;
      },
      (err) => {
        this.logger.error(`Deppon Error: ${err.message}`, err.stack);
        return Promise.reject(err);
      },
    );
  }

  /**
   * 生成德邦 API 签名
   * 德邦开放平台使用 MD5 签名方式
   */
  private generateSign(params: Record<string, any>, appSecret: string): string {
    // 按 key 排序并拼接参数
    const sortedKeys = Object.keys(params).sort();
    const signStr =
      sortedKeys.map((key) => `${key}${params[key]}`).join('') + appSecret;

    return crypto
      .createHash('md5')
      .update(signStr, 'utf8')
      .digest('hex')
      .toUpperCase();
  }

  /**
   * 构建带签名的请求参数
   */
  private buildSignedParams(
    businessParams: Record<string, any>,
  ): Record<string, any> {
    const timestamp = new Date().toISOString().replace(/[:\-]\.\d{3}Z/, '');
    const params: Record<string, any> = {
      customerCode: this.config.appId || '',
      timestamp,
      ...businessParams,
    };

    // 添加签名
    params.sign = this.generateSign(params, this.config.appSecret || '');

    return params;
  }

  /**
   * Generic Request Wrapper
   */
  private async post<T>(url: string, businessData: any): Promise<T> {
    try {
      const params = this.buildSignedParams(businessData);
      const response = await this.axiosInstance.post<DepponResponse<T>>(
        url,
        params,
      );
      const resData = response.data;

      // 德邦 API 返回码: 1000 表示成功
      if (resData.resultCode !== '1000' && resData.resultCode !== '0') {
        throw new Error(
          `Deppon API Error [${resData.resultCode}]: ${resData.resultMsg}`,
        );
      }

      return resData.data as T;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate parameters
   */
  private async validateParams<T extends object>(
    dtoClass: new () => T,
    params: any,
  ): Promise<T> {
    const dto = plainToInstance(dtoClass, params);
    try {
      await validateOrReject(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });
      return dto;
    } catch (errors) {
      const messages = Array.isArray(errors)
        ? errors
            .map((e) => Object.values(e.constraints || {}).join(', '))
            .join('; ')
        : String(errors);
      throw new BadRequestException(`Parameter Validation Failed: ${messages}`);
    }
  }

  /**
   * 1. Pre-check - 预检查/运力查询
   */
  async precheck(params: DepponPrecheckDto): Promise<DepponPrecheckResult> {
    const validParams = await this.validateParams(DepponPrecheckDto, params);
    return this.post<DepponPrecheckResult>(
      '/openapi/v1/order/precheck',
      validParams,
    );
  }

  /**
   * 2. Create Order - 创建订单
   */
  async createOrder(
    params: DepponCreateOrderDto,
  ): Promise<DepponCreateOrderResult> {
    const validParams = await this.validateParams(DepponCreateOrderDto, params);
    return this.post<DepponCreateOrderResult>(
      '/openapi/v1/order/create',
      validParams,
    );
  }

  /**
   * 3. Subscribe Trace - 订阅物流轨迹
   */
  async subscribeTrace(params: DepponSubscribeTraceDto): Promise<boolean> {
    const validParams = await this.validateParams(
      DepponSubscribeTraceDto,
      params,
    );
    await this.post('/openapi/v1/trace/subscribe', validParams);
    return true;
  }

  /**
   * 4. Query Trace - 查询物流轨迹
   */
  async queryTrace(
    params: DepponQueryTraceDto,
  ): Promise<DepponQueryTraceResult> {
    const validParams = await this.validateParams(DepponQueryTraceDto, params);
    return this.post<DepponQueryTraceResult>(
      '/openapi/v1/trace/query',
      validParams,
    );
  }

  /**
   * 5. Modify Order - 修改订单
   */
  async modifyOrder(params: DepponModifyOrderDto): Promise<boolean> {
    const validParams = await this.validateParams(DepponModifyOrderDto, params);
    await this.post('/openapi/v1/order/modify', validParams);
    return true;
  }

  /**
   * 6. Cancel Order - 取消订单
   */
  async cancelOrder(params: DepponCancelOrderDto): Promise<boolean> {
    const validParams = await this.validateParams(DepponCancelOrderDto, params);
    await this.post('/openapi/v1/order/cancel', validParams);
    return true;
  }

  /**
   * 7. Query Status - 查询运单状态
   */
  async queryStatus(
    params: DepponQueryStatusDto,
  ): Promise<DepponQueryStatusResult> {
    const validParams = await this.validateParams(DepponQueryStatusDto, params);
    return this.post<DepponQueryStatusResult>(
      '/openapi/v1/order/status',
      validParams,
    );
  }

  /**
   * 8. Query Fee - 查询运费
   */
  async queryFee(params: DepponQueryFeeDto): Promise<DepponQueryFeeResult> {
    const validParams = await this.validateParams(DepponQueryFeeDto, params);
    return this.post<DepponQueryFeeResult>(
      '/openapi/v1/order/fee',
      validParams,
    );
  }
}
