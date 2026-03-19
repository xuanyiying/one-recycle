/**
 * AI 大模型统一接口定义
 * 支持多平台大模型接入（百度、阿里、腾讯等）
 */

/**
 * 支持的 AI 平台类型
 */
export enum AIProviderType {
  OPENAI = 'openai',
  BAIDU = 'baidu', // 百度文心一言
  ALIYUN = 'aliyun', // 阿里通义千问
  TENCENT = 'tencent', // 腾讯混元
  OLLAMA = 'ollama', // 本地 Ollama
  SILICONCLOUD = 'siliconcloud', // SiliconCloud
  OPENROUTER = 'openrouter', // OpenRouter
}

/**
 * 消息角色
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool' | 'order';

/**
 * 聊天消息定义，支持系统、用户、助手、工具、订单消息角色
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

/**
 * 工具调用定义
 */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * 工具定义
 */
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

/**
 * AI 请求配置
 */
export interface AIRequestConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  timeout?: number;
  retryCount?: number;
}

/**
 * AI 请求参数
 */
export interface AIRequest {
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  toolChoice?:
    | 'auto'
    | 'none'
    | { type: 'function'; function: { name: string } };
  config?: AIRequestConfig;
}

/**
 * AI 响应结果
 */
export interface AIResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProviderType;
  finishReason: string;
  rawResponse?: any;
}

/**
 * AI 提供商配置
 */
export interface AIProviderConfig {
  type: AIProviderType;
  apiKey: string;
  apiSecret?: string; // 部分平台需要
  baseURL?: string;
  defaultModel: string;
  availableModels: string[];
  timeout?: number;
  maxRetries?: number;
}

/**
 * 模型选择策略
 */
export enum ModelSelectionStrategy {
  PRIORITY = 'priority', // 按优先级选择
  ROUND_ROBIN = 'round_robin', // 轮询
  RANDOM = 'random', // 随机
  HEALTH_CHECK = 'health_check', // 健康检查
}

/**
 * AI 服务配置
 */
export interface AIServiceConfig {
  defaultProvider: AIProviderType;
  providers: AIProviderConfig[];
  selectionStrategy: ModelSelectionStrategy;
  fallbackEnabled: boolean;
  requestTimeout: number;
  maxRetries: number;
}

/**
 * AI 调用结果
 */
export interface AICallResult {
  success: boolean;
  response?: AIResponse;
  error?: AIError;
  latency: number;
  retryCount: number;
}

/**
 * AI 错误信息
 */
export interface AIError {
  code: string;
  message: string;
  provider: AIProviderType;
  statusCode?: number;
  rawError?: any;
}

/**
 * AI 提供商接口
 * 所有提供商需实现此接口
 */
export interface IAIProvider {
  readonly type: AIProviderType;
  readonly name: string;
  readonly isAvailable: boolean;

  /**
   * 发送聊天请求
   */
  chat(request: AIRequest): Promise<AIResponse>;

  /**
   * 检查服务健康状态
   */
  healthCheck(): Promise<boolean>;

  /**
   * 获取可用模型列表
   */
  getAvailableModels(): string[];

  /**
   * 验证配置是否有效
   */
  validateConfig(): boolean;
}

/**
 * 流式响应回调
 */
export type StreamCallback = (chunk: string, isDone: boolean) => void;

/**
 * 流式请求参数
 */
export interface AIStreamRequest extends AIRequest {
  streamCallback: StreamCallback;
}
