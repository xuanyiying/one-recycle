/**
 * 百度文心一言 (ERNIE) 提供商实现
 * 文档：https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html
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
 * 百度文心一言响应格式
 */
interface BaiduResponse {
  id: string;
  object: string;
  created: number;
  result: string;
  is_truncated: boolean;
  need_clear_history: boolean;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  function_call?: {
    name: string;
    arguments: string;
    thoughts?: string;
  };
}

/**
 * 百度文心一言错误响应
 */
interface BaiduError {
  error_code: number;
  error_msg: string;
}

@Injectable()
export class BaiduProvider implements IAIProvider {
  readonly type = AIProviderType.BAIDU;
  readonly name = '百度文心一言';
  private readonly logger = new Logger(BaiduProvider.name);

  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  // 文心一言模型映射
  private readonly modelMapping: Record<string, string> = {
    'ernie-bot': 'completions_pro',
    'ernie-bot-turbo': 'eb-instant',
    'ernie-bot-4': 'completions_pro',
    'ernie-bot-8k': 'ernie-bot-8k',
    'ernie-speed': 'ernie-speed',
    'ernie-lite': 'ernie-lite-8k',
  };

  constructor(
    private readonly config: AIProviderConfig,
    private readonly httpService: HttpService,
  ) {}

  /**
   * 获取 access token
   */
  private async getAccessToken(): Promise<string> {
    // 检查 token 是否过期（提前 5 分钟刷新）
    if (this.accessToken && Date.now() < this.tokenExpireTime - 300000) {
      return this.accessToken;
    }

    try {
      const url = 'https://aip.baidubce.com/oauth/2.0/token';
      const response = await lastValueFrom(
        this.httpService.post(url, null, {
          params: {
            grant_type: 'client_credentials',
            client_id: this.config.apiKey,
            client_secret: this.config.apiSecret,
          },
        }),
      );

      this.accessToken = response.data.access_token;
      // token 有效期通常为 30 天
      this.tokenExpireTime = Date.now() + response.data.expires_in * 1000;

      this.logger.log('Baidu access token refreshed');
      return this.accessToken!;
    } catch (error: any) {
      this.logger.error('Failed to get Baidu access token', error);
      throw this.createError('TOKEN_ERROR', '获取访问令牌失败', error);
    }
  }

  /**
   * 发送聊天请求
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const accessToken = await this.getAccessToken();
      const model = this.getModelName(
        request.config?.model || this.config.defaultModel,
      );

      const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${model}?access_token=${accessToken}`;

      const body = this.buildRequestBody(request);

      this.logger.debug(`Sending request to Baidu ERNIE: ${model}`);

      const response = await lastValueFrom(
        this.httpService.post<BaiduResponse | BaiduError>(url, body, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: request.config?.timeout || this.config.timeout || 30000,
        }),
      );

      const data = response.data;

      // 检查错误
      if ('error_code' in data) {
        throw this.createError(
          `BAIDU_${data.error_code}`,
          data.error_msg,
          data,
        );
      }

      const baiduResponse = data;
      const latency = Date.now() - startTime;

      this.logger.log(`Baidu ERNIE response received in ${latency}ms`);

      return this.parseResponse(baiduResponse, request);
    } catch (error: any) {
      if (error.code && error.provider) {
        throw error;
      }
      throw this.createError('REQUEST_ERROR', '请求文心一言失败', error);
    }
  }

  /**
   * 构建请求体
   */
  private buildRequestBody(request: AIRequest): any {
    const messages = this.convertMessages(request.messages);

    const body: any = {
      messages,
      temperature: request.config?.temperature ?? 0.8,
      top_p: request.config?.topP ?? 0.95,
      max_output_tokens: request.config?.maxTokens ?? 2048,
    };

    // 添加工具（Function Calling）
    if (request.tools && request.tools.length > 0) {
      body.functions = request.tools.map((tool) => ({
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters,
      }));

      if (request.toolChoice === 'auto') {
        body.tool_choice = 'auto';
      }
    }

    return body;
  }

  /**
   * 转换消息格式
   * 百度文心一言支持 system、user、assistant 角色
   */
  private convertMessages(messages: ChatMessage[]): any[] {
    return messages.map((msg) => {
      // 转换 tool 角色为 assistant
      if (msg.role === 'tool') {
        return {
          role: 'assistant',
          content: msg.content,
        };
      }

      return {
        role: msg.role,
        content: msg.content,
      };
    });
  }

  /**
   * 解析响应
   */
  private parseResponse(
    response: BaiduResponse,
    _request: AIRequest,
  ): AIResponse {
    const toolCalls: ToolCall[] = [];

    // 解析 function_call
    if (response.function_call) {
      toolCalls.push({
        id: `call_${Date.now()}`,
        type: 'function',
        function: {
          name: response.function_call.name,
          arguments: response.function_call.arguments,
        },
      });
    }

    return {
      content: response.result,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: this.config.defaultModel,
      provider: AIProviderType.BAIDU,
      finishReason: response.is_truncated ? 'length' : 'stop',
      rawResponse: response,
    };
  }

  /**
   * 检查服务健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): string[] {
    return (
      this.config.availableModels || [
        'ernie-bot',
        'ernie-bot-turbo',
        'ernie-bot-4',
        'ernie-bot-8k',
        'ernie-speed',
        'ernie-lite',
      ]
    );
  }

  /**
   * 验证配置是否有效
   */
  validateConfig(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.apiSecret &&
      this.config.defaultModel
    );
  }

  /**
   * 获取模型名称
   */
  private getModelName(model: string): string {
    return this.modelMapping[model] || model;
  }

  /**
   * 获取可用性状态
   */
  get isAvailable(): boolean {
    return this.validateConfig() && Date.now() < this.tokenExpireTime;
  }

  /**
   * 创建错误对象
   */
  private createError(code: string, message: string, rawError?: any): AIError {
    return new AIError(
      code,
      message,
      AIProviderType.BAIDU,
      undefined,
      rawError,
    );
  }
}
