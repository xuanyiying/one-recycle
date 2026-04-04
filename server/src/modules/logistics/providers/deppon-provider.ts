import { BadRequestException, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import * as crypto from 'crypto';
import {
  DepponResponse,
} from '../dto/deppon.dto';
import {
  CancelOrderDto,
  CreateOrderDto,
  CreateOrderResult,
  ModifyOrderDto,
  PrecheckDto,
  PrecheckResult,
  QueryFeeDto,
  QueryFeeResult,
  QueryStatusDto,
  QueryStatusResult,
  QueryTraceDto,
  QueryTraceResult,
  SubscribeTraceDto,
} from '../dto/jdl.dto';
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
    const timestamp = new Date().toISOString().replace(/[:\-\.]|\.\d{3}Z/g, '');
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
  private async post<T>(
    url: string,
    businessData: any,
    responseDtoClass?: new () => any,
  ): Promise<T> {
    try {
      const params = this.buildSignedParams(businessData);
      const response = await this.axiosInstance.post<DepponResponse<T>>(
        url,
        params,
      );
      const resData = response.data;

      // 德邦 API 返回码: 1000 表示成功
      if (resData.resultCode === '1000' || resData.resultCode === '0') {
        if (responseDtoClass && resData.data) {
          return this.validateResponse(responseDtoClass, resData.data) as unknown as T;
        }
        return resData.data as T;
      }
      throw new Error(
        `Deppon API Error [${resData.resultCode}]: ${resData.resultMsg}`,
      );
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
   * Validate response
   */
  private async validateResponse<T extends object>(
    dtoClass: new () => T,
    data: any,
  ): Promise<T> {
    const dto = plainToInstance(dtoClass, data);
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
      this.logger.error(`Response Validation Failed: ${messages}`);
      throw new Error(`Response Validation Failed: ${messages}`);
    }
  }

  /**
   * 1. Pre-check - 预检查/运力查询
   */
  async precheck(params: PrecheckDto): Promise<PrecheckResult> {
    const validParams = await this.validateParams(PrecheckDto, params);
    return this.post<PrecheckResult>(
      '/openapi/v1/order/precheck',
      validParams,
      PrecheckResult,
    );
  }

  /**
   * 2. Create Order - 创建订单
   */
  async createOrder(
    params: CreateOrderDto,
  ): Promise<CreateOrderResult> {
    const validParams = await this.validateParams(CreateOrderDto, params);
    return this.post<CreateOrderResult>(
      '/openapi/v1/order/create',
      validParams,
      CreateOrderResult,
    );
  }

  /**
   * 3. Subscribe Trace - 订阅物流轨迹
   */
  async subscribeTrace(params: SubscribeTraceDto): Promise<boolean> {
    const validParams = await this.validateParams(
      SubscribeTraceDto,
      params,
    );
    await this.post('/openapi/v1/trace/subscribe', validParams);
    return true;
  }

  /**
   * 4. Query Trace - 查询物流轨迹
   */
  async queryTrace(
    params: QueryTraceDto,
  ): Promise<QueryTraceResult> {
    const validParams = await this.validateParams(QueryTraceDto, params);
    return this.post<QueryTraceResult>(
      '/openapi/v1/trace/query',
      validParams,
      QueryTraceResult,
    );
  }

  /**
   * 5. Modify Order - 修改订单
   */
  async modifyOrder(params: ModifyOrderDto): Promise<boolean> {
    const validParams = await this.validateParams(ModifyOrderDto, params);
    await this.post('/openapi/v1/order/modify', validParams);
    return true;
  }

  /**
   * 6. Cancel Order - 取消订单
   */
  async cancelOrder(params: CancelOrderDto): Promise<boolean> {
    const validParams = await this.validateParams(CancelOrderDto, params);
    await this.post('/openapi/v1/order/cancel', validParams);
    return true;
  }

  /**
   * 7. Query Status - 查询运单状态
   */
  async queryStatus(
    params: QueryStatusDto,
  ): Promise<QueryStatusResult> {
    const validParams = await this.validateParams(QueryStatusDto, params);
    return this.post<QueryStatusResult>(
      '/openapi/v1/order/status',
      validParams,
      QueryStatusResult,
    );
  }

  /**
   * 8. Query Fee - 查询运费
   */
  async queryFee(params: QueryFeeDto): Promise<QueryFeeResult> {
    const validParams = await this.validateParams(QueryFeeDto, params);
    return this.post<QueryFeeResult>(
      '/openapi/v1/order/fee',
      validParams,
      QueryFeeResult,
    );
  }
}
