/**
 * SiliconCloud AI Provider
 * SiliconCloud 平台 AI 提供商实现
 * SiliconCloud API 兼容 OpenAI API 格式
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
 * SiliconCloud 响应格式（OpenAI 兼容）
 */
interface SiliconCloudResponse {
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
 * SiliconCloud 错误响应
 */
interface SiliconCloudError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * SiliconCloud 模型信息
 */
interface ModelInfo {
  name: string;
  contextWindow: number;
  costPerInputToken: number;
  costPerOutputToken: number;
}

@Injectable()
export class SiliconCloudProvider implements IAIProvider {
  readonly type = AIProviderType.SILICONCLOUD;
  readonly name = 'SiliconCloud';
  private readonly logger = new Logger(SiliconCloudProvider.name);

  private readonly defaultBaseURL = 'https://api.siliconflow.cn/v1';

  // SiliconCloud 常用模型列表
  private readonly availableModels = [
    'Pro/moonshotai/Kimi-K2.5',
    'deepseek-ai/DeepSeek-V3',
    'deepseek-ai/DeepSeek-V2.5',
    'deepseek-ai/DeepSeek-Coder-V2',
    'Qwen/Qwen2.5-72B-Instruct',
    'Qwen/Qwen2.5-32B-Instruct',
    'Qwen/Qwen2.5-14B-Instruct',
    'Qwen/Qwen2.5-7B-Instruct',
    'Qwen/Qwen2-72B-Instruct',
    'Qwen/Qwen2-7B-Instruct',
    'meta-llama/Meta-Llama-3.1-70B-Instruct',
    'meta-llama/Meta-Llama-3.1-8B-Instruct',
    'THUDM/glm-4-9b-chat',
    '01-ai/Yi-1.5-34B-Chat',
  ];

  // 模型信息缓存
  private modelInfoCache: Map<string, ModelInfo> = new Map();

  constructor(
    private readonly config: AIProviderConfig,
    private readonly httpService: HttpService,
  ) {
    this.initializeModelInfo();
  }

  /**
   * 初始化模型信息
   */
  private initializeModelInfo(): void {
    // Pro/Moonshot 系列
    this.modelInfoCache.set('Pro/moonshotai/Kimi-K2.5', {
      name: 'Pro/moonshotai/Kimi-K2.5',
      contextWindow: 32000,
      costPerInputToken: 0.004 / 1000,
      costPerOutputToken: 0.021 / 1000,
    });
    // DeepSeek 系列
    this.modelInfoCache.set('deepseek-ai/DeepSeek-V3', {
      name: 'deepseek-ai/DeepSeek-V3',
      contextWindow: 64000,
      costPerInputToken: 0.002 / 1000,
      costPerOutputToken: 0.002 / 1000,
    });
    this.modelInfoCache.set('deepseek-ai/DeepSeek-V2.5', {
      name: 'deepseek-ai/DeepSeek-V2.5',
      contextWindow: 32000,
      costPerInputToken: 0.001 / 1000,
      costPerOutputToken: 0.001 / 1000,
    });
    this.modelInfoCache.set('deepseek-ai/DeepSeek-Coder-V2', {
      name: 'deepseek-ai/DeepSeek-Coder-V2',
      contextWindow: 32000,
      costPerInputToken: 0.001 / 1000,
      costPerOutputToken: 0.001 / 1000,
    });

    // Qwen 系列
    this.modelInfoCache.set('Qwen/Qwen2.5-72B-Instruct', {
      name: 'Qwen/Qwen2.5-72B-Instruct',
      contextWindow: 32000,
      costPerInputToken: 0.004 / 1000,
      costPerOutputToken: 0.004 / 1000,
    });
    this.modelInfoCache.set('Qwen/Qwen2.5-32B-Instruct', {
      name: 'Qwen/Qwen2.5-32B-Instruct',
      contextWindow: 32000,
      costPerInputToken: 0.002 / 1000,
      costPerOutputToken: 0.002 / 1000,
    });
    this.modelInfoCache.set('Qwen/Qwen2.5-14B-Instruct', {
      name: 'Qwen/Qwen2.5-14B-Instruct',
      contextWindow: 32000,
      costPerInputToken: 0.001 / 1000,
      costPerOutputToken: 0.001 / 1000,
    });
    this.modelInfoCache.set('Qwen/Qwen2.5-7B-Instruct', {
      name: 'Qwen/Qwen2.5-7B-Instruct',
      contextWindow: 32000,
      costPerInputToken: 0.0005 / 1000,
      costPerOutputToken: 0.0005 / 1000,
    });

    // Llama 系列
    this.modelInfoCache.set('meta-llama/Meta-Llama-3.1-70B-Instruct', {
      name: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      contextWindow: 32000,
      costPerInputToken: 0.003 / 1000,
      costPerOutputToken: 0.003 / 1000,
    });
    this.modelInfoCache.set('meta-llama/Meta-Llama-3.1-8B-Instruct', {
      name: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      contextWindow: 32000,
      costPerInputToken: 0.0005 / 1000,
      costPerOutputToken: 0.0005 / 1000,
    });
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

      this.logger.debug(`Sending request to SiliconCloud: ${model}`);

      const response = await lastValueFrom(
        this.httpService.post<SiliconCloudResponse | SiliconCloudError>(
          url,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.config.apiKey}`,
            },
            timeout: request.config?.timeout || this.config.timeout || 60000,
          },
        ),
      );

      const data = response.data;

      // 检查错误
      if ('error' in data) {
        const error = data;
        throw this.createError(
          error.error.code || 'UNKNOWN_ERROR',
          error.error.message,
          error,
        );
      }

      const siliconResponse = data;
      const latency = Date.now() - startTime;

      this.logger.log(`SiliconCloud response received in ${latency}ms`);

      return this.parseResponse(siliconResponse);
    } catch (error: any) {
      if (error.code && error.provider) {
        throw error;
      }
      throw this.createError('REQUEST_ERROR', '请求 SiliconCloud 失败', error);
    }
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
    return messages.map((msg) => {
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
  private parseResponse(response: SiliconCloudResponse): AIResponse {
    const choice = response.choices[0];
    const message = choice.message;
    const toolCalls: ToolCall[] = [];

    // 解析 tool_calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      message.tool_calls.forEach((tc) => {
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
      provider: AIProviderType.SILICONCLOUD,
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
      // SiliconCloud 的模型列表端点
      const url = `${baseURL}/models`;

      await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
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
                model: this.config.defaultModel || 'deepseek-ai/DeepSeek-V3',
                messages: [{ role: 'user', content: 'hi' }],
                max_tokens: 1,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.config.apiKey}`,
                },
                timeout: 10000,
              },
            ),
          );
          return true;
        } catch (innerError) {
          this.logger.warn(
            `SiliconCloud health check failed: ${innerError instanceof Error ? innerError.message : String(innerError)}`,
          );
          return false;
        }
      }

      this.logger.warn(
        `SiliconCloud health check failed: ${error instanceof Error ? error.message : String(error)}`,
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
    return new AIError(
      code,
      message,
      AIProviderType.SILICONCLOUD,
      undefined,
      rawError,
    );
  }

  /**
   * 获取模型信息
   */
  getModelInfo(modelName: string): ModelInfo | undefined {
    return this.modelInfoCache.get(modelName);
  }

  /**
   * 获取所有模型信息
   */
  getAllModelInfo(): ModelInfo[] {
    return Array.from(this.modelInfoCache.values());
  }
}
