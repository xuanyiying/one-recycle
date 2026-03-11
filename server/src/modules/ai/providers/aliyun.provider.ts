/**
 * 阿里通义千问 (Qwen) 提供商实现
 * 文档：https://help.aliyun.com/document_detail/611472.html
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
 * 阿里通义千问响应格式
 */
interface AliyunResponse {
  output: {
    text?: string;
    finish_reason: string;
    choices?: Array<{
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
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  request_id: string;
}

/**
 * 阿里通义千问错误响应
 */
interface AliyunError {
  code: string;
  message: string;
  request_id: string;
}

@Injectable()
export class AliyunProvider implements IAIProvider {
  readonly type = AIProviderType.ALIYUN;
  readonly name = '阿里通义千问';
  private readonly logger = new Logger(AliyunProvider.name);

  private readonly baseURL = 'https://dashscope.aliyuncs.com/api/v1';

  // 通义千问模型列表
  private readonly availableModels = [
    'qwen-turbo',
    'qwen-plus',
    'qwen-max',
    'qwen-max-longcontext',
    'qwen-coder-plus',
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
      const url = `${this.baseURL}/services/aigc/text-generation/generation`;

      const body = this.buildRequestBody(request, model);

      this.logger.debug(`Sending request to Aliyun Qwen: ${model}`);

      const response = await lastValueFrom(
        this.httpService.post<AliyunResponse | AliyunError>(url, body, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          timeout: request.config?.timeout || this.config.timeout || 30000,
        }),
      );

      const data = response.data;

      // 检查错误
      if ('code' in data && 'message' in data) {
        const error = data as AliyunError;
        throw this.createError(error.code, error.message, error);
      }

      const aliyunResponse = data as AliyunResponse;
      const latency = Date.now() - startTime;

      this.logger.log(`Aliyun Qwen response received in ${latency}ms`);

      return this.parseResponse(aliyunResponse, model);
    } catch (error: any) {
      if (error.code && error.provider) {
        throw error;
      }
      throw this.createError('REQUEST_ERROR', '请求通义千问失败', error);
    }
  }

  /**
   * 构建请求体
   */
  private buildRequestBody(request: AIRequest, model: string): any {
    const messages = this.convertMessages(request.messages);

    const body: any = {
      model,
      input: {
        messages,
      },
      parameters: {
        temperature: request.config?.temperature ?? 0.8,
        top_p: request.config?.topP ?? 0.8,
        max_tokens: request.config?.maxTokens ?? 2000,
        result_format: 'message',
      },
    };

    // 添加工具（Function Calling）
    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.function.name,
          description: tool.function.description,
          parameters: tool.function.parameters,
        },
      }));

      if (request.toolChoice === 'auto') {
        body.tool_choice = { type: 'auto' };
      }
    }

    return body;
  }

  /**
   * 转换消息格式
   * 通义千问支持 system、user、assistant、tool 角色
   */
  private convertMessages(messages: ChatMessage[]): any[] {
    return messages.map(msg => {
      const converted: any = {
        role: msg.role,
        content: msg.content,
      };

      // 添加 tool_calls（如果存在）
      if (msg.tool_calls) {
        converted.tool_calls = msg.tool_calls.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        }));
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
  private parseResponse(response: AliyunResponse, model: string): AIResponse {
    const choice = response.output.choices?.[0];
    
    if (!choice) {
      // 兼容旧版响应格式
      return {
        content: response.output.text || '',
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model,
        provider: AIProviderType.ALIYUN,
        finishReason: response.output.finish_reason,
        rawResponse: response,
      };
    }

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
      content: message.content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model,
      provider: AIProviderType.ALIYUN,
      finishReason: choice.finish_reason,
      rawResponse: response,
    };
  }

  /**
   * 检查服务健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 发送一个简单的请求测试连通性
      const url = `${this.baseURL}/services/aigc/text-generation/generation`;
      await lastValueFrom(
        this.httpService.post(
          url,
          {
            model: 'qwen-turbo',
            input: {
              messages: [{ role: 'user', content: 'hi' }],
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
            },
          },
        ),
      );
      return true;
    } catch (error: any) {
      // 如果返回 400 说明认证通过但请求参数有问题，也算可用
      if (error.response?.status === 400) {
        return true;
      }
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
      provider: AIProviderType.ALIYUN,
      rawError,
    };
  }
}
