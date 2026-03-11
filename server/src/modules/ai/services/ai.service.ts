/**
 * AI 大模型服务核心类
 * 统一管理多个 AI 提供商，支持智能路由和故障转移
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
  IAIProvider,
  AIProviderType,
  AIRequest,
  AIProviderConfig,
  AICallResult,
  AIError,
  ModelSelectionStrategy,
} from '../interfaces/ai.interface';
import { OpenAIProvider } from '../providers/openai.provider';
import { BaiduProvider } from '../providers/baidu.provider';
import { AliyunProvider } from '../providers/aliyun.provider';
import { TencentProvider } from '../providers/tencent.provider';
import { OllamaProvider } from '../providers/ollama.provider';
import { SiliconCloudProvider } from '../providers/siliconcloud.provider';
import { OpenRouterProvider } from '../providers/openrouter.provider';

interface ProviderHealth {
  provider: IAIProvider;
  isHealthy: boolean;
  lastCheckTime: number;
  consecutiveFailures: number;
}

@Injectable()
export class AIService implements OnModuleInit {
  private readonly logger = new Logger(AIService.name);
  private providers: Map<AIProviderType, ProviderHealth> = new Map();
  private currentProviderIndex = 0;
  private providerOrder: AIProviderType[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }

  /**
   * 模块初始化时加载所有配置的提供商
   */
  async onModuleInit() {
    this.logger.log('Initializing AI Service...');
    await this.loadProviders();
    this.logger.log(`Loaded ${this.providers.size} AI providers`);
  }

  /**
   * 加载所有配置的提供商
   */
  private async loadProviders() {
    // OpenAI
    const openaiConfig = this.loadProviderConfig(AIProviderType.OPENAI);
    if (openaiConfig) {
      const provider = new OpenAIProvider(openaiConfig, this.httpService);
      if (provider.validateConfig()) {
        this.providers.set(AIProviderType.OPENAI, {
          provider,
          isHealthy: true,
          lastCheckTime: 0,
          consecutiveFailures: 0,
        });
        this.providerOrder.push(AIProviderType.OPENAI);
      }
    }

    // 百度文心一言
    const baiduConfig = this.loadProviderConfig(AIProviderType.BAIDU);
    if (baiduConfig) {
      const provider = new BaiduProvider(baiduConfig, this.httpService);
      if (provider.validateConfig()) {
        this.providers.set(AIProviderType.BAIDU, {
          provider,
          isHealthy: true,
          lastCheckTime: 0,
          consecutiveFailures: 0,
        });
        this.providerOrder.push(AIProviderType.BAIDU);
      }
    }

    // 阿里通义千问
    const aliyunConfig = this.loadProviderConfig(AIProviderType.ALIYUN);
    if (aliyunConfig) {
      const provider = new AliyunProvider(aliyunConfig, this.httpService);
      if (provider.validateConfig()) {
        this.providers.set(AIProviderType.ALIYUN, {
          provider,
          isHealthy: true,
          lastCheckTime: 0,
          consecutiveFailures: 0,
        });
        this.providerOrder.push(AIProviderType.ALIYUN);
      }
    }

    // 腾讯混元
    const tencentConfig = this.loadProviderConfig(AIProviderType.TENCENT);
    if (tencentConfig) {
      const provider = new TencentProvider(tencentConfig, this.httpService);
      if (provider.validateConfig()) {
        this.providers.set(AIProviderType.TENCENT, {
          provider,
          isHealthy: true,
          lastCheckTime: 0,
          consecutiveFailures: 0,
        });
        this.providerOrder.push(AIProviderType.TENCENT);
      }
    }

    // Ollama (本地部署)
    const ollamaConfig = this.loadProviderConfig(AIProviderType.OLLAMA);
    if (ollamaConfig) {
      const provider = new OllamaProvider(ollamaConfig, this.httpService);
      if (provider.validateConfig()) {
        this.providers.set(AIProviderType.OLLAMA, {
          provider,
          isHealthy: true,
          lastCheckTime: 0,
          consecutiveFailures: 0,
        });
        this.providerOrder.push(AIProviderType.OLLAMA);
      }
    }

    // SiliconCloud
    const siliconCloudConfig = this.loadProviderConfig(AIProviderType.SILICONCLOUD);
    if (siliconCloudConfig) {
      const provider = new SiliconCloudProvider(siliconCloudConfig, this.httpService);
      if (provider.validateConfig()) {
        this.providers.set(AIProviderType.SILICONCLOUD, {
          provider,
          isHealthy: true,
          lastCheckTime: 0,
          consecutiveFailures: 0,
        });
        this.providerOrder.push(AIProviderType.SILICONCLOUD);
      }
    }

    // OpenRouter
    const openRouterConfig = this.loadProviderConfig(AIProviderType.OPENROUTER);
    if (openRouterConfig) {
      const provider = new OpenRouterProvider(openRouterConfig, this.httpService);
      if (provider.validateConfig()) {
        this.providers.set(AIProviderType.OPENROUTER, {
          provider,
          isHealthy: true,
          lastCheckTime: 0,
          consecutiveFailures: 0,
        });
        this.providerOrder.push(AIProviderType.OPENROUTER);
      }
    }
  }

  /**
   * 加载提供商配置
   */
  private loadProviderConfig(type: AIProviderType): AIProviderConfig | null {
    const prefix = type.toUpperCase();
    const apiKey = this.configService.get<string>(`${prefix}_API_KEY`);

    if (!apiKey) {
      this.logger.warn(`${type} API key not configured`);
      return null;
    }

    const config: AIProviderConfig = {
      type,
      apiKey,
      apiSecret: this.configService.get<string>(`${prefix}_API_SECRET`),
      baseURL: this.configService.get<string>(`${prefix}_BASE_URL`),
      defaultModel: this.configService.get<string>(`${prefix}_MODEL`) || this.getDefaultModel(type),
      availableModels: this.getAvailableModels(type),
      timeout: this.configService.get<number>(`${prefix}_TIMEOUT`) || 30000,
      maxRetries: this.configService.get<number>(`${prefix}_MAX_RETRIES`) || 3,
    };

    return config;
  }

  /**
   * 获取默认模型
   */
  private getDefaultModel(type: AIProviderType): string {
    const defaults: Record<AIProviderType, string> = {
      [AIProviderType.OPENAI]: 'gpt-4o-mini',
      [AIProviderType.BAIDU]: 'ernie-bot-turbo',
      [AIProviderType.ALIYUN]: 'qwen-turbo',
      [AIProviderType.TENCENT]: 'hunyuan-lite',
      [AIProviderType.OLLAMA]: 'llama3',
      [AIProviderType.SILICONCLOUD]: 'deepseek-ai/DeepSeek-V3',
      [AIProviderType.OPENROUTER]: 'meta-llama/llama-3.3-70b-instruct:free',
    };
    return defaults[type];
  }

  /**
   * 获取可用模型列表
   */
  private getAvailableModels(type: AIProviderType): string[] {
    const models: Record<AIProviderType, string[]> = {
      [AIProviderType.OPENAI]: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      [AIProviderType.BAIDU]: ['ernie-bot', 'ernie-bot-turbo', 'ernie-bot-4', 'ernie-speed'],
      [AIProviderType.ALIYUN]: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-coder-plus'],
      [AIProviderType.TENCENT]: ['hunyuan-lite', 'hunyuan-standard', 'hunyuan-pro'],
      [AIProviderType.OLLAMA]: ['llama3', 'llama3.1', 'mistral', 'qwen2', 'deepseek-coder'],
      [AIProviderType.SILICONCLOUD]: [
        'deepseek-ai/DeepSeek-V3',
        'deepseek-ai/DeepSeek-V2.5',
        'Qwen/Qwen2.5-72B-Instruct',
        'meta-llama/Meta-Llama-3.1-70B-Instruct',
      ],
      [AIProviderType.OPENROUTER]: [
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-r1-distill-llama-70b:free',
        'google/gemini-2.5-pro-exp-03-25:free',
        'qwen/qwen-2-7b-instruct:free',
      ],
    };
    return models[type];
  }

  /**
   * 发送聊天请求
   * 支持自动故障转移和重试
   */
  async chat(request: AIRequest, preferredProvider?: AIProviderType): Promise<AICallResult> {
    const startTime = Date.now();
    let lastError: AIError | undefined;
    let retryCount = 0;

    // 确定要尝试的提供商列表
    const providersToTry = preferredProvider
      ? [preferredProvider, ...this.providerOrder.filter(p => p !== preferredProvider)]
      : this.selectProvidersByStrategy();

    for (const providerType of providersToTry) {
      const health = this.providers.get(providerType);

      if (!health || !health.isHealthy) {
        this.logger.warn(`Provider ${providerType} is not available, skipping`);
        continue;
      }

      try {
        this.logger.debug(`Trying provider: ${providerType}`);

        const response = await health.provider.chat(request);

        // 重置失败计数
        health.consecutiveFailures = 0;

        const latency = Date.now() - startTime;

        this.logger.log(`Request succeeded with ${providerType} in ${latency}ms`);

        return {
          success: true,
          response,
          latency,
          retryCount,
        };
      } catch (error: any) {
        retryCount++;
        health.consecutiveFailures++;

        this.logger.error(
          `Provider ${providerType} failed (attempt ${retryCount}):`,
          error.message,
        );

        lastError = error;

        // 如果连续失败超过阈值，标记为不健康
        if (health.consecutiveFailures >= 3) {
          health.isHealthy = false;
          this.logger.warn(`Provider ${providerType} marked as unhealthy`);
        }
      }
    }

    // 所有提供商都失败
    const latency = Date.now() - startTime;

    this.logger.error('All AI providers failed');

    return {
      success: false,
      error: lastError || {
        code: 'NO_PROVIDER_AVAILABLE',
        message: '没有可用的 AI 提供商',
        provider: AIProviderType.OPENAI,
      },
      latency,
      retryCount,
    };
  }

  /**
   * 根据策略选择提供商
   */
  private selectProvidersByStrategy(): AIProviderType[] {
    const strategy = this.configService.get<ModelSelectionStrategy>(
      'AI_SELECTION_STRATEGY',
      ModelSelectionStrategy.PRIORITY,
    );

    switch (strategy) {
      case ModelSelectionStrategy.ROUND_ROBIN:
        return this.selectRoundRobin();
      case ModelSelectionStrategy.RANDOM:
        return this.selectRandom();
      case ModelSelectionStrategy.HEALTH_CHECK:
        return this.selectByHealth();
      case ModelSelectionStrategy.PRIORITY:
      default:
        return [...this.providerOrder];
    }
  }

  /**
   * 轮询选择
   */
  private selectRoundRobin(): AIProviderType[] {
    const providers = [...this.providerOrder];
    const selected = providers.splice(this.currentProviderIndex, 1);
    const result = [...selected, ...providers];

    this.currentProviderIndex = (this.currentProviderIndex + 1) % providers.length;

    return result;
  }

  /**
   * 随机选择
   */
  private selectRandom(): AIProviderType[] {
    const providers = [...this.providerOrder];

    // Fisher-Yates 洗牌算法
    for (let i = providers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [providers[i], providers[j]] = [providers[j], providers[i]];
    }

    return providers;
  }

  /**
   * 按健康状态选择
   */
  private selectByHealth(): AIProviderType[] {
    const healthy: AIProviderType[] = [];
    const unhealthy: AIProviderType[] = [];

    for (const [type, health] of this.providers) {
      if (health.isHealthy) {
        healthy.push(type);
      } else {
        unhealthy.push(type);
      }
    }

    return [...healthy, ...unhealthy];
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<Record<AIProviderType, boolean>> {
    const results: Record<AIProviderType, boolean> = {} as any;

    for (const [type, health] of this.providers) {
      try {
        const isHealthy = await health.provider.healthCheck();
        health.isHealthy = isHealthy;
        health.lastCheckTime = Date.now();

        if (isHealthy) {
          health.consecutiveFailures = 0;
        }

        results[type] = isHealthy;
      } catch {
        health.isHealthy = false;
        results[type] = false;
      }
    }

    return results;
  }

  /**
   * 获取所有提供商状态
   */
  getProviderStatus(): Array<{
    type: AIProviderType;
    name: string;
    isAvailable: boolean;
    isHealthy: boolean;
    models: string[];
  }> {
    return Array.from(this.providers.entries()).map(([type, health]) => ({
      type,
      name: health.provider.name,
      isAvailable: health.provider.isAvailable,
      isHealthy: health.isHealthy,
      models: health.provider.getAvailableModels(),
    }));
  }

  /**
   * 获取指定提供商
   */
  getProvider(type: AIProviderType): IAIProvider | undefined {
    return this.providers.get(type)?.provider;
  }

  /**
   * 检查是否有可用的提供商
   */
  get hasAvailableProvider(): boolean {
    return Array.from(this.providers.values()).some(h => h.isHealthy);
  }

  /**
   * 获取默认提供商类型
   */
  getDefaultProvider(): AIProviderType {
    const defaultType = this.configService.get<AIProviderType>(
      'AI_DEFAULT_PROVIDER',
      AIProviderType.OPENAI,
    );

    if (this.providers.has(defaultType)) {
      return defaultType;
    }

    return this.providerOrder[0] || AIProviderType.OPENAI;
  }
}
