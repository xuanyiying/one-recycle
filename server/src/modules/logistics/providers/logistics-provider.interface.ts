import {
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

export interface LogisticsProviderConfig {
  code: string; // 提供商代码（如 JDL）
  name: string; // 提供商名称（如 京东物流）
  apiUrl?: string; // API 基础 URL（如 https://api.jdlogistics.com）
  appId?: string; // 应用 ID（如 123456）
  appSecret?: string; // 应用密钥（如 abcdef123456）
  config?: Record<string, any>; // 其他自定义配置（如 超时时间、日志级别等）
}

export interface ILogisticsProvider {
  readonly code: string;
  readonly name: string;

  precheck(params: PrecheckDto): Promise<PrecheckResult>;
  createOrder(params: CreateOrderDto): Promise<CreateOrderResult>;
  subscribeTrace(params: SubscribeTraceDto): Promise<boolean>;
  queryTrace(params: QueryTraceDto): Promise<any>;
  modifyOrder(params: ModifyOrderDto): Promise<boolean>;
  cancelOrder(params: CancelOrderDto): Promise<boolean>;
  queryStatus(params: QueryStatusDto): Promise<any>;
  queryFee(params: QueryFeeDto): Promise<any>;
}

export interface ILogisticsProviderConstructor {
  new (config: LogisticsProviderConfig): ILogisticsProvider;
}

export interface ProviderWithConfig {
  provider: ILogisticsProvider;
  config: LogisticsProviderConfig;
}

export interface ILogisticsProviderFactory {
  getProvider(
    providerCode: string,
    config?: LogisticsProviderConfig,
  ): Promise<ILogisticsProvider>;
  getProviderWithConfig(
    providerCode: string,
    config?: LogisticsProviderConfig,
  ): Promise<ProviderWithConfig>;
  getActiveProvider(): Promise<ILogisticsProvider>;
  getActiveProviderWithConfig(): Promise<ProviderWithConfig>;
  registerProvider(
    code: string,
    constructor: ILogisticsProviderConstructor,
  ): void;
  clearCache(): void;
}
