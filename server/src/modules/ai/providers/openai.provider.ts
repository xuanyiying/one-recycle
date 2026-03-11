/**
 * OpenAI / 兼容 OpenAI API 的提供商实现
 * 支持 OpenAI、Azure OpenAI、DeepSeek 等兼容 API
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
 * OpenAI 响应格式
 */
interface OpenAIResponse {
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
 * OpenAI 错误响应
 */
interface OpenAIError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

@Injectable()
export class OpenAIProvider implements IAIProvider {
  readonly type = AIProviderType.OPENAI;
  readonly name = 'OpenAI';
  private readonly logger = new Logger(OpenAIProvider.name);

  private readonly defaultBaseURL = 'https://api.openai.com/v1';

  // 常用模型列表
  private readonly availableModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'deepseek-chat',
    'deepseek-coder',
  ];

  constructor(
    private readonly config: AIProviderConfig,
    private readonly httpService: HttpService,
  ) {}

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

      this.logger.debug(`Sending request to OpenAI: ${model}`);

      const response = await lastValueFrom(
        this.httpService.post<OpenAIResponse | OpenAIError>(url, body, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          timeout: request.config?.timeout || this.config.timeout || 60000,
        }),
      );

      const data = response.data;

      // 检查错误
      if ('error' in data) {
        const error = data as OpenAIError;
        throw this.createError(
          error.error.code || 'UNKNOWN_ERROR',
          error.error.message,
          error,
        );
      }

      const openaiResponse = data as OpenAIResponse;
      const latency = Date.now() - startTime;

      this.logger.log(`OpenAI response received in ${latency}ms`);

      return this.parseResponse(openaiResponse);
    } catch (error: any) {
      if (error.code && error.provider) {
        throw error;
      }
      throw this.createError('REQUEST_ERROR', '请求 OpenAI 失败', error);
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
  private parseResponse(response: OpenAIResponse): AIResponse {
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
      provider: AIProviderType.OPENAI,
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
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          timeout: 10000,
        }),
      );
      return true;
    } catch {
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
      provider: AIProviderType.OPENAI,
      rawError,
    };
  }
}
