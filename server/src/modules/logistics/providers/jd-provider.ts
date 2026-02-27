import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import {
  EcapResponse,
  PrecheckDto,
  PrecheckResult,
  CreateOrderDto,
  CreateOrderResult,
  SubscribeTraceDto,
  QueryTraceDto,
  ModifyOrderDto,
  CancelOrderDto,
  QueryStatusDto,
  QueryFeeDto,
} from '../dto/jdl.dto';

@Injectable()
export class JdlLogisticsService {
  private readonly logger = new Logger(JdlLogisticsService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly customerCode: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>(
      'JDL_BASE_URL',
      'https://api.jdl.com',
    );
    this.apiKey = this.config.get<string>('JDL_API_KEY', '');
    this.customerCode = this.config.get<string>('JDL_CUSTOMER_CODE', '');

    if (!this.apiKey || !this.customerCode) {
      this.logger.warn(
        'JDL API Key or Customer Code not configured. Set JDL_API_KEY and JDL_CUSTOMER_CODE environment variables.',
      );
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
        'X-Customer-Code': this.customerCode,
      },
    });

    // Logging Interceptor
    this.axiosInstance.interceptors.request.use((req) => {
      this.logger.debug(
        `ECAP Request: ${req.method?.toUpperCase()} ${req.url} ${JSON.stringify(req.data)}`,
      );
      return req;
    });
    this.axiosInstance.interceptors.response.use(
      (res) => {
        this.logger.debug(`ECAP Response: ${JSON.stringify(res.data)}`);
        return res;
      },
      (err) => {
        this.logger.error(`ECAP Error: ${err.message}`, err.stack);
        return Promise.reject(err);
      },
    );
  }

  /**
   * Generic Request Wrapper
   */
  private async post<T>(url: string, data: any): Promise<T> {
    try {
      const response = await this.axiosInstance.post<EcapResponse<T>>(
        url,
        data,
      );
      const resData = response.data;

      // Assuming 200 or 0 is success code, adjust based on actual ECAP docs
      if (
        resData.code !== '200' &&
        resData.code !== '0' &&
        resData.code !== 'SUCCESS'
      ) {
        throw new Error(`ECAP API Error [${resData.code}]: ${resData.message}`);
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

  // 1. Pre-check (/ecap/v1/orders/precheck)
  async precheck(params: PrecheckDto): Promise<PrecheckResult> {
    const validParams = await this.validateParams(PrecheckDto, params);
    return this.post<PrecheckResult>('/ecap/v1/orders/precheck', validParams);
  }

  // 2. Create Order (/ecap/v1/orders/create)
  async createOrder(params: CreateOrderDto): Promise<CreateOrderResult> {
    const validParams = await this.validateParams(CreateOrderDto, params);
    return this.post<CreateOrderResult>('/ecap/v1/orders/create', validParams);
  }

  // 3. Subscribe Trace (/ecap/v1/orders/trace/subscribe)
  async subscribeTrace(params: SubscribeTraceDto): Promise<boolean> {
    const validParams = await this.validateParams(SubscribeTraceDto, params);
    await this.post('/ecap/v1/orders/trace/subscribe', validParams);
    return true;
  }

  // 4. Query Trace (/ecap/v1/orders/trace/query)
  async queryTrace(params: QueryTraceDto): Promise<any> {
    const validParams = await this.validateParams(QueryTraceDto, params);
    return this.post('/ecap/v1/orders/trace/query', validParams);
  }

  // 5. Modify Order (/ecap/v1/orders/modify)
  async modifyOrder(params: ModifyOrderDto): Promise<boolean> {
    const validParams = await this.validateParams(ModifyOrderDto, params);
    await this.post('/ecap/v1/orders/modify', validParams);
    return true;
  }

  // 6. Cancel Order (/ecap/v1/orders/cancel)
  async cancelOrder(params: CancelOrderDto): Promise<boolean> {
    const validParams = await this.validateParams(CancelOrderDto, params);
    await this.post('/ecap/v1/orders/cancel', validParams);
    return true;
  }

  // 7. Query Status (/ecap/v1/orders/status/get)
  async queryStatus(params: QueryStatusDto): Promise<any> {
    const validParams = await this.validateParams(QueryStatusDto, params);
    return this.post('/ecap/v1/orders/status/get', validParams);
  }

  // 8. Query Fee (/ecap/v1/orders/actualfee/query)
  async queryFee(params: QueryFeeDto): Promise<any> {
    const validParams = await this.validateParams(QueryFeeDto, params);
    return this.post('/ecap/v1/orders/actualfee/query', validParams);
  }
}
