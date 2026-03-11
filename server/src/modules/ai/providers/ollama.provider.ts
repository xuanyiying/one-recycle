/**
 * Ollama AI Provider
 * 本地 Ollama 部署的 AI 提供商实现
 * 使用 Ollama 的 OpenAI 兼容 API
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
 * Ollama 响应格式（OpenAI 兼容）
 */
interface OllamaResponse {
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
 * Ollama 错误响应
 */
interface OllamaError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

@Injectable()
export class OllamaProvider implements IAIProvider {
  readonly type = AIProviderType.OLLAMA;
  readonly name = 'Ollama';
  private readonly logger = new Logger(OllamaProvider.name);

  private readonly defaultBaseURL = 'http://localhost:11434';

  // 常用本地模型列表
  private readonly availableModels = [
    'llama2',
    'llama3',
    'llama3.1',
    'mistral',
    'codellama',
    'qwen2',
    'qwen2.5',
    'deepseek-coder',
    'phi3',
    'gemma',
    'gemma2',
  ];

  constructor(
    private readonly config: AIProviderConfig,
    private readonly httpService: HttpService,
  ) { }

  /**
   * 发送聊天请求
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const model = request.config?.model || this.config.defaultModel;
      const baseURL = this.config.baseURL || this.defaultBaseURL;
      // Ollama 的 OpenAI 兼容端点
      const url = `${baseURL}/v1/chat/completions`;

      const body = this.buildRequestBody(request, model);

      this.logger.debug(`Sending request to Ollama: ${model}`);

      const response = await lastValueFrom(
        this.httpService.post<OllamaResponse | OllamaError>(url, body, {
          headers: {
            'Content-Type': 'application/json',
            // Ollama 不需要 API Key，但如果提供了就使用
            ...(this.config.apiKey && {
              'Authorization': `Bearer ${this.config.apiKey}`,
            }),
          },
          timeout: request.config?.timeout || this.config.timeout || 120000, // 本地模型可能需要更长时间
        }),
      );

      const data = response.data;

      // 检查错误
      if ('error' in data) {
        const error = data as OllamaError;
        throw this.createError(
          error.error.code || 'UNKNOWN_ERROR',
          error.error.message,
          error,
        );
      }

      const ollamaResponse = data as OllamaResponse;
      const latency = Date.now() - startTime;

      this.logger.log(`Ollama response received in ${latency}ms`);

      return this.parseResponse(ollamaResponse);
    } catch (error: any) {
      if (error.code && error.provider) {
        throw error;
      }
      throw this.createError('REQUEST_ERROR', '请求 Ollama 失败', error);
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
  private parseResponse(response: OllamaResponse): AIResponse {
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
      provider: AIProviderType.OLLAMA,
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
      // Ollama 的本地 API 端点
      const url = `${baseURL}/api/tags`;

      await lastValueFrom(
        this.httpService.get(url, {
          timeout: 5000,
        }),
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Ollama health check failed: ${error instanceof Error ? error.message : String(error)}`
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
    // Ollama 只需要有默认模型即可，API Key 是可选的
    return !!this.config.defaultModel;
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
      provider: AIProviderType.OLLAMA,
      rawError,
    };
  }

  /**
   * 获取本地模型列表（从 Ollama 服务）
   */
  async fetchLocalModels(): Promise<string[]> {
    try {
      const baseURL = this.config.baseURL || this.defaultBaseURL;
      const url = `${baseURL}/api/tags`;

      const response = await lastValueFrom(
        this.httpService.get<{ models: Array<{ name: string }> }>(url, {
          timeout: 10000,
        }),
      );

      return response.data.models.map(m => m.name);
    } catch (error) {
      this.logger.error(
        `Failed to fetch Ollama models: ${error instanceof Error ? error.message : String(error)}`
      );
      return [];
    }
  }
}
