/**
 * OpenRouter AI Provider
 * OpenRouter 平台 AI 提供商实现
 * OpenRouter API 兼容 OpenAI API 格式，聚合多个 AI 模型提供商
 * 文档：https://openrouter.ai/docs
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  IAIProvider,
  AIProviderType,
  AIRequest,
  AIResponse,
  AIProviderConfig,
  AIError,
  ChatMessage,
  ToolCall,
} from '../interfaces/ai.interface';

/**
 * OpenRouter 响应格式（OpenAI 兼容）
 */
interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter 错误响应
 */
interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * OpenRouter Provider 配置
 */
interface OpenRouterProviderConfig {
  siteUrl?: string;    // HTTP-Referer 头
  siteName?: string;   // X-Title 头
}

@Injectable()
export class OpenRouterProvider implements IAIProvider {
  readonly type = AIProviderType.OPENROUTER;
  readonly name = 'OpenRouter';
  private readonly logger = new Logger(OpenRouterProvider.name);

  private readonly defaultBaseURL = 'https://openrouter.ai/api/v1';

  // OpenRouter 免费模型列表（带 :free 后缀）
  // 注：免费模型列表会动态变化，建议定期更新
  private readonly availableModels = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1-distill-llama-70b:free',
    'google/gemini-2.5-pro-exp-03-25:free',
    'qwen/qwen-2-7b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'meta-llama/llama-3.2-1b-instruct:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'nousresearch/hermes-3-llama-3.1-70b:free',
    'cognitivecomputations/dolphin-mixtral-8x22b:free',
    'google/gemma-2-9b-it:free',
    'mistralai/mistral-7b-instruct:free',
  ];

  // OpenRouter 特殊配置
  private readonly openRouterConfig: OpenRouterProviderConfig;

  constructor(
    private readonly config: AIProviderConfig,
    private readonly httpService: HttpService,
  ) {
    // 解析 OpenRouter 特殊配置
    this.openRouterConfig = {
      siteUrl: (config as any).siteUrl || 'https://github.com/one-recycle',
      siteName: (config as any).siteName || 'OneRecycle',
    };
  }

  /**
   * 发送聊天请求
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const model = request.config?.model || this.config.defaultModel;
      const baseURL = this.config.baseURL || this.defaultBaseURL;
      const url = `${baseURL}/chat/completions`;

      const body = this.buildRequestBody(request, model);

      this.logger.debug(`Sending request to OpenRouter: ${model}`);

      const response = await lastValueFrom(
        this.httpService.post<OpenRouterResponse | OpenRouterError>(url, body, {
          headers: this.buildHeaders(),
          timeout: request.config?.timeout || this.config.timeout || 60000,
        }),
      );

      const data = response.data;

      // 检查错误
      if ('error' in data) {
        const error = data as OpenRouterError;
        throw this.createError(
          error.error.code || 'UNKNOWN_ERROR',
          error.error.message,
          error,
        );
      }

      const openRouterResponse = data as OpenRouterResponse;
      const latency = Date.now() - startTime;

      this.logger.log(`OpenRouter response received in ${latency}ms`);

      return this.parseResponse(openRouterResponse);
    } catch (error: any) {
      if (error.code && error.provider) {
        throw error;
      }
      
      // 特殊错误处理：402 Payment Required
      if (error.response?.status === 402) {
        throw this.createError(
          'PAYMENT_REQUIRED',
          '免费模型请求失败，请检查 HTTP-Referer 和 X-Title 请求头是否正确配置',
          error,
        );
      }

      // 网络错误
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw this.createError('TIMEOUT', '请求超时', error);
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw this.createError('NETWORK_ERROR', '网络连接失败', error);
      }

      // 速率限制
      if (error.response?.status === 429) {
        throw this.createError('RATE_LIMIT', 'API 请求速率超限', error);
      }

      throw this.createError('REQUEST_ERROR', '请求 OpenRouter 失败', error);
    }
  }

  /**
   * 构建请求头
   * OpenRouter 需要额外的请求头用于统计和防滥用
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

    // 添加 OpenRouter 特殊请求头（免费模型必需）
    if (this.openRouterConfig.siteUrl) {
      headers['HTTP-Referer'] = this.openRouterConfig.siteUrl;
    }
    
    if (this.openRouterConfig.siteName) {
      headers['X-Title'] = this.openRouterConfig.siteName;
    }

    return headers;
  }

  /**
   * 构建请求体
   */
  private buildRequestBody(request: AIRequest, model: string): any {
    const messages = this.convertMessages(request.messages);

    const body: any = {
      model,
      messages,
      temperature: request.config?.temperature ?? 0.7,
      top_p: request.config?.topP ?? 1.0,
      max_tokens: request.config?.maxTokens ?? 2000,
    };

    // 添加工具（Function Calling）
    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools;

      if (request.toolChoice) {
        body.tool_choice = request.toolChoice;
      }
    }

    return body;
  }

  /**
   * 转换消息格式
   */
  private convertMessages(messages: ChatMessage[]): any[] {
    return messages.map(msg => {
      const converted: any = {
        role: msg.role,
        content: msg.content,
      };

      // 添加 tool_calls（如果存在）
      if (msg.tool_calls) {
        converted.tool_calls = msg.tool_calls;
      }

      // 添加 tool_call_id（如果是 tool 消息）
      if (msg.tool_call_id) {
        converted.tool_call_id = msg.tool_call_id;
      }

      return converted;
    });
  }

  /**
   * 解析响应
   */
  private parseResponse(response: OpenRouterResponse): AIResponse {
    const choice = response.choices[0];
    const message = choice.message;
    const toolCalls: ToolCall[] = [];

    // 解析 tool_calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      message.tool_calls.forEach(tc => {
        toolCalls.push({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        });
      });
    }

    return {
      content: message.content || '',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: response.model,
      provider: AIProviderType.OPENROUTER,
      finishReason: choice.finish_reason,
      rawResponse: response,
    };
  }

  /**
   * 检查服务健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      const baseURL = this.config.baseURL || this.defaultBaseURL;
      const url = `${baseURL}/models`;

      await lastValueFrom(
        this.httpService.get(url, {
          headers: this.buildHeaders(),
          timeout: 10000,
        }),
      );
      return true;
    } catch (error: any) {
      // 如果模型列表端点不可用，尝试一个简单的 completion 请求
      if (error?.response?.status === 404) {
        try {
          const baseURL = this.config.baseURL || this.defaultBaseURL;
          const url = `${baseURL}/chat/completions`;

          await lastValueFrom(
            this.httpService.post(
              url,
              {
                model: this.config.defaultModel || 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [{ role: 'user', content: 'hi' }],
                max_tokens: 1,
              },
              {
                headers: this.buildHeaders(),
                timeout: 10000,
              },
            ),
          );
          return true;
        } catch (innerError) {
          this.logger.warn(
            `OpenRouter health check failed: ${innerError instanceof Error ? innerError.message : String(innerError)}`
          );
          return false;
        }
      }

      this.logger.warn(
        `OpenRouter health check failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): string[] {
    return this.config.availableModels || this.availableModels;
  }

  /**
   * 验证配置是否有效
   */
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.defaultModel);
  }

  /**
   * 获取可用性状态
   */
  get isAvailable(): boolean {
    return this.validateConfig();
  }

  /**
   * 创建错误对象
   */
  private createError(code: string, message: string, rawError?: any): AIError {
    return {
      code,
      message,
      provider: AIProviderType.OPENROUTER,
      statusCode: rawError?.response?.status,
      rawError,
    };
  }

  /**
   * 获取免费模型列表
   * 返回所有带有 :free 后缀的模型
   */
  getFreeModels(): string[] {
    return this.availableModels.filter(model => model.includes(':free'));
  }

  /**
   * 检查模型是否为免费模型
   */
  isFreeModel(model: string): boolean {
    return model.includes(':free');
  }
}
