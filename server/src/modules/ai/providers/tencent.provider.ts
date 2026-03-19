/**
 * 腾讯混元 (Hunyuan) 提供商实现
 * 文档：https://cloud.tencent.com/document/product/1729/101843
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as crypto from 'crypto';
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
 * 腾讯混元响应格式
 */
interface TencentResponse {
  Response: {
    Choices: Array<{
      Message: {
        Role: string;
        Content: string;
        ToolCalls?: Array<{
          Id: string;
          Type: string;
          Function: {
            Name: string;
            Arguments: string;
          };
        }>;
      };
      FinishReason: string;
    }>;
    Usage: {
      PromptTokens: number;
      CompletionTokens: number;
      TotalTokens: number;
    };
    RequestId: string;
    Error?: {
      Code: string;
      Message: string;
    };
  };
}

@Injectable()
export class TencentProvider implements IAIProvider {
  readonly type = AIProviderType.TENCENT;
  readonly name = '腾讯混元';
  private readonly logger = new Logger(TencentProvider.name);

  private readonly baseURL = 'https://hunyuan.tencentcloudapi.com';
  private readonly service = 'hunyuan';
  private readonly version = '2023-09-01';
  private readonly action = 'ChatCompletions';

  // 混元模型列表
  private readonly availableModels = [
    'hunyuan-lite',
    'hunyuan-standard',
    'hunyuan-standard-256K',
    'hunyuan-pro',
    'hunyuan-code',
    'hunyuan-role',
    'hunyuan-functioncall',
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

      // 构建请求体
      const body = this.buildRequestBody(request, model);

      // 生成签名
      const headers = this.generateSignature(body);

      this.logger.debug(`Sending request to Tencent Hunyuan: ${model}`);

      const response = await lastValueFrom(
        this.httpService.post<TencentResponse>(this.baseURL, body, {
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          timeout: request.config?.timeout || this.config.timeout || 60000,
        }),
      );

      const data = response.data;

      // 检查错误
      if (data.Response.Error) {
        throw this.createError(
          data.Response.Error.Code,
          data.Response.Error.Message,
          data.Response,
        );
      }

      const latency = Date.now() - startTime;
      this.logger.log(`Tencent Hunyuan response received in ${latency}ms`);

      return this.parseResponse(data, model);
    } catch (error: any) {
      if (error.code && error.provider) {
        throw error;
      }
      throw this.createError('REQUEST_ERROR', '请求腾讯混元失败', error);
    }
  }

  /**
   * 构建请求体
   */
  private buildRequestBody(request: AIRequest, model: string): any {
    const messages = this.convertMessages(request.messages);

    const body: any = {
      Model: model,
      Messages: messages,
      Temperature: request.config?.temperature ?? 0.8,
      TopP: request.config?.topP ?? 1.0,
      MaxTokens: request.config?.maxTokens ?? 2048,
    };

    // 添加工具（Function Calling）
    if (request.tools && request.tools.length > 0) {
      body.Functions = request.tools.map((tool) => ({
        Name: tool.function.name,
        Description: tool.function.description,
        Parameters: tool.function.parameters,
      }));

      if (request.toolChoice === 'auto') {
        body.FunctionCall = 'auto';
      }
    }

    return body;
  }

  /**
   * 转换消息格式
   * 混元支持 system、user、assistant、tool 角色
   */
  private convertMessages(messages: ChatMessage[]): any[] {
    return messages.map((msg) => {
      const converted: any = {
        Role: msg.role,
        Content: msg.content,
      };

      // 添加 ToolCalls（如果存在）
      if (msg.tool_calls) {
        converted.ToolCalls = msg.tool_calls.map((tc) => ({
          Id: tc.id,
          Type: tc.type,
          Function: {
            Name: tc.function.name,
            Arguments: tc.function.arguments,
          },
        }));
      }

      // 添加 ToolCallId（如果是 tool 消息）
      if (msg.tool_call_id) {
        converted.ToolCallId = msg.tool_call_id;
      }

      return converted;
    });
  }

  /**
   * 解析响应
   */
  private parseResponse(response: TencentResponse, model: string): AIResponse {
    const choice = response.Response.Choices[0];
    const message = choice.Message;
    const toolCalls: ToolCall[] = [];

    // 解析 ToolCalls
    if (message.ToolCalls && message.ToolCalls.length > 0) {
      message.ToolCalls.forEach((tc) => {
        toolCalls.push({
          id: tc.Id,
          type: 'function',
          function: {
            name: tc.Function.Name,
            arguments: tc.Function.Arguments,
          },
        });
      });
    }

    return {
      content: message.Content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens: response.Response.Usage?.PromptTokens || 0,
        completionTokens: response.Response.Usage?.CompletionTokens || 0,
        totalTokens: response.Response.Usage?.TotalTokens || 0,
      },
      model,
      provider: AIProviderType.TENCENT,
      finishReason: choice.FinishReason,
      rawResponse: response,
    };
  }

  /**
   * 生成腾讯云 API 签名
   */
  private generateSignature(payload: any): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const date = new Date().toISOString().split('T')[0];

    // 构建规范请求
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = `content-type:application/json\nhost:${new URL(this.baseURL).host}\n`;
    const signedHeaders = 'content-type;host';
    const hashedRequestPayload = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');

    const canonicalRequest = [
      httpRequestMethod,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      hashedRequestPayload,
    ].join('\n');

    // 构建待签名字符串
    const credentialScope = `${date}/${this.service}/tc3_request`;
    const hashedCanonicalRequest = crypto
      .createHash('sha256')
      .update(canonicalRequest)
      .digest('hex');

    const stringToSign = [
      'TC3-HMAC-SHA256',
      timestamp,
      credentialScope,
      hashedCanonicalRequest,
    ].join('\n');

    // 计算签名
    const secretDate = crypto
      .createHmac('sha256', `TC3${this.config.apiSecret}`)
      .update(date)
      .digest();
    const secretService = crypto
      .createHmac('sha256', secretDate)
      .update(this.service)
      .digest();
    const secretSigning = crypto
      .createHmac('sha256', secretService)
      .update('tc3_request')
      .digest();
    const signature = crypto
      .createHmac('sha256', secretSigning)
      .update(stringToSign)
      .digest('hex');

    // 构建 Authorization
    const authorization = [
      'TC3-HMAC-SHA256',
      `Credential=${this.config.apiKey}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ');

    return {
      Authorization: authorization,
      'X-TC-Action': this.action,
      'X-TC-Version': this.version,
      'X-TC-Timestamp': timestamp,
      'X-TC-Region': 'ap-guangzhou',
    };
  }

  /**
   * 检查服务健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      const body = {
        Model: 'hunyuan-lite',
        Messages: [{ Role: 'user', Content: 'hi' }],
      };

      const headers = this.generateSignature(body);

      await lastValueFrom(
        this.httpService.post(this.baseURL, body, {
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }),
      );
      return true;
    } catch (error: any) {
      // 如果返回业务错误说明服务可用
      if (error.response?.data?.Response?.RequestId) {
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
    return !!(
      this.config.apiKey &&
      this.config.apiSecret &&
      this.config.defaultModel
    );
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
      provider: AIProviderType.TENCENT,
      rawError,
    };
  }
}
