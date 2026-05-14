import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { LogisticsService } from '../logistics.service';
import { JdlLogisticsProvider } from './jd-provider';
import { DepponLogisticsProvider } from './deppon-provider';
import {
  ILogisticsProvider,
  ILogisticsProviderFactory,
  LogisticsProviderConfig,
  ILogisticsProviderConstructor,
  ProviderWithConfig,
} from './logistics-provider.interface';

@Injectable()
export class LogisticsProviderFactory implements ILogisticsProviderFactory {
  private readonly logger = new Logger(LogisticsProviderFactory.name);
  private readonly providerConstructors: Map<
    string,
    ILogisticsProviderConstructor
  > = new Map();
  private readonly providerConfigs: Map<string, LogisticsProviderConfig> =
    new Map();

  constructor(private readonly logisticsService: LogisticsService) {
    this.registerBuiltInProviders();
  }

  /**
   * 注册内置物流提供商
   */
  private registerBuiltInProviders(): void {
    this.providerConstructors.set('JD', JdlLogisticsProvider);
    this.providerConstructors.set('JDL', JdlLogisticsProvider);
    this.providerConstructors.set('DEPPON', DepponLogisticsProvider);
    this.logger.log('Registered built-in logistics providers: JD, JDL, DEPPON');
  }

  /**
   * 注册新的物流提供商
   */
  registerProvider(
    code: string,
    constructor: ILogisticsProviderConstructor,
  ): void {
    if (!code || typeof code !== 'string') {
      throw new BadRequestException('Provider code must be a non-empty string');
    }

    if (!constructor) {
      throw new BadRequestException('Provider constructor is required');
    }

    const normalizedCode = code.toUpperCase().trim();
    this.providerConstructors.set(normalizedCode, constructor);
    this.logger.log(`Registered logistics provider: ${normalizedCode}`);
  }

  /**
   * 清除配置缓存
   */
  clearCache(): void {
    this.providerConfigs.clear();
    this.logger.log('Provider config cache cleared');
  }

  /**
   * 获取物流提供商（仅返回 provider）
   */
  async getProvider(
    providerCode: string,
    config?: LogisticsProviderConfig,
  ): Promise<ILogisticsProvider> {
    const { provider } = await this.getProviderWithConfig(providerCode, config);
    return provider;
  }

  /**
   * 获取物流提供商及配置
   */
  async getProviderWithConfig(
    providerCode: string,
    config?: LogisticsProviderConfig,
  ): Promise<ProviderWithConfig> {
    if (!providerCode || typeof providerCode !== 'string') {
      throw new BadRequestException('Provider code must be a non-empty string');
    }

    const normalizedCode = providerCode.toUpperCase().trim();

    if (!normalizedCode) {
      throw new BadRequestException('Provider code cannot be empty');
    }

    this.logger.debug(`Creating provider instance: ${normalizedCode}`);

    // 获取构造函数
    const Constructor = this.providerConstructors.get(normalizedCode);
    if (!Constructor) {
      throw new NotFoundException(
        `Logistics provider '${providerCode}' not found`,
      );
    }

    // 如果没有传入配置，从数据库获取
    const providerConfig =
      config || (await this.getProviderConfigFromDatabase(normalizedCode));

    if (!providerConfig) {
      throw new NotFoundException(
        `Configuration for provider '${providerCode}' not found. ` +
          `Please configure it in the database or pass config parameter.`,
      );
    }

    // 动态创建实例（类似 Java: new JdlLogisticsProvider(config)）
    const provider = new Constructor(providerConfig);
    this.logger.log(
      `Created provider instance: ${normalizedCode} (${provider.name})`,
    );

    return { provider, config: providerConfig };
  }

  /**
   * 获取当前活跃的物流提供商
   */
  async getActiveProvider(): Promise<ILogisticsProvider> {
    const { provider } = await this.getActiveProviderWithConfig();
    return provider;
  }

  /**
   * 获取当前活跃的物流提供商及配置
   */
  async getActiveProviderWithConfig(): Promise<ProviderWithConfig> {
    this.logger.debug('Getting active provider');

    try {
      const result = await this.logisticsService.findAll({
        isActive: true,
        limit: 1,
      });

      if (result.data && result.data.length > 0) {
        const provider = result.data[0];
        this.logger.log(
          `Found active provider: ${provider.name} (${provider.code})`,
        );
        return this.getProviderWithConfig(provider.code);
      }

      this.logger.warn('No active provider found in database');
    } catch (error) {
      this.logger.warn(
        `Failed to get active provider from database: ${error as Error}`,
      );
    }

    // 默认使用 JD
    this.logger.log('Falling back to default JD provider');
    return this.getProviderWithConfig('JD');
  }

  /**
   * 从数据库获取提供商配置
   */
  private async getProviderConfigFromDatabase(
    providerCode: string,
  ): Promise<LogisticsProviderConfig | null> {
    const cacheKey = providerCode.toUpperCase();

    // 检查缓存
    const cached = this.providerConfigs.get(cacheKey);
    if (cached) {
      this.logger.debug(`Using cached config for provider: ${cacheKey}`);
      return cached;
    }

    try {
      this.logger.debug(
        `Fetching provider config from database: ${providerCode}`,
      );

      const result = await this.logisticsService.findAll({
        search: providerCode,
        isActive: true,
        limit: 1,
      });

      if (result.data && result.data.length > 0) {
        const provider = result.data[0];

        const config = this.validateAndParseConfig({
          code: provider.code,
          name: provider.name,
          apiUrl: provider.apiUrl,
          appId: provider.appId,
          appSecret: provider.appSecret,
          config: provider.config,
        });

        // 缓存配置
        this.providerConfigs.set(cacheKey, config);
        this.logger.log(`Loaded and cached provider config: ${cacheKey}`);

        return config;
      }

      this.logger.debug(`No provider found in database for: ${providerCode}`);
    } catch (error) {
      this.logger.error(
        `Failed to get provider from database: ${error as Error}`,
      );
    }

    return null;
  }

  /**
   * 验证并解析配置
   */
  private validateAndParseConfig(data: {
    code?: string | null;
    name?: string | null;
    apiUrl?: string | null;
    appId?: string | null;
    appSecret?: string | null;
    config?: Record<string, any> | null;
  }): LogisticsProviderConfig {
    if (!data.code || typeof data.code !== 'string') {
      throw new BadRequestException(
        'Provider code is required and must be a string',
      );
    }

    if (!data.name || typeof data.name !== 'string') {
      throw new BadRequestException(
        'Provider name is required and must be a string',
      );
    }

    return {
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      apiUrl: data.apiUrl?.trim() || undefined,
      appId: data.appId?.trim() || undefined,
      appSecret: data.appSecret?.trim() || undefined,
      config:
        typeof data.config === 'object' && data.config !== null
          ? data.config
          : {},
    };
  }
}
