/**
 * 基于 AI 大模型的语音下单服务
 * 使用多平台 AI 进行意图识别和实体提取
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  AIService,
  AIProviderType,
  ChatMessage,
  ToolDefinition,
} from '@/modules/ai';

export interface VoiceOrderContext {
  userId: string;
  sessionId: string;
  collectedData: {
    itemType?: string;
    quantity?: string;
    address?: string;
    phone?: string;
    pickupTime?: string;
    notes?: string;
  };
  currentStep: string;
}

export interface VoiceOrderAIResponse {
  content: string;
  extractedData?: {
    itemType?: string;
    quantity?: string;
    address?: string;
    phone?: string;
    pickupTime?: string;
    notes?: string;
  };
  nextStep: string;
  isComplete: boolean;
  needConfirm: boolean;
  provider?: AIProviderType;
  latency?: number;
}

@Injectable()
export class AIVoiceOrderService {
  private readonly logger = new Logger(AIVoiceOrderService.name);

  // 定义语音下单工具
  private readonly tools: ToolDefinition[] = [
    {
      type: 'function',
      function: {
        name: 'extract_order_info',
        description: '从用户语音中提取订单信息',
        parameters: {
          type: 'object',
          properties: {
            itemType: {
              type: 'string',
              description: '物品类型，如：旧手机、笔记本电脑、旧衣服等',
            },
            quantity: {
              type: 'string',
              description: '数量，如：3部、5公斤、2台等',
            },
            address: {
              type: 'string',
              description: '取件地址',
            },
            phone: {
              type: 'string',
              description: '联系电话',
            },
            pickupTime: {
              type: 'string',
              description: '期望取件时间，如：明天下午3点、本周五等',
            },
            notes: {
              type: 'string',
              description: '备注信息',
            },
          },
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'confirm_order',
        description: '确认订单信息是否完整',
        parameters: {
          type: 'object',
          properties: {
            isComplete: {
              type: 'boolean',
              description: '订单信息是否完整',
            },
            missingFields: {
              type: 'array',
              items: { type: 'string' },
              description: '缺失的字段',
            },
          },
          required: ['isComplete'],
        },
      },
    },
  ];

  constructor(private readonly aiService: AIService) {}

  /**
   * 处理语音输入
   */
  async processVoiceInput(
    input: string,
    context: VoiceOrderContext,
    preferredProvider?: AIProviderType,
  ): Promise<VoiceOrderAIResponse> {
    const startTime = Date.now();

    try {
      // 检查是否有可用的 AI 提供商
      if (!this.aiService.hasAvailableProvider) {
        this.logger.warn('No AI provider available');
        return {
          content: '抱歉，AI 服务暂时不可用，请稍后再试。',
          nextStep: context.currentStep,
          isComplete: false,
          needConfirm: false,
        };
      }

      // 构建系统提示词
      const systemPrompt = this.buildSystemPrompt(context);

      // 构建消息列表
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ];

      // 调用 AI 服务
      const result = await this.aiService.chat(
        {
          messages,
          tools: this.tools,
          toolChoice: 'auto',
          config: {
            temperature: 0.3, // 语音下单需要更确定性的回复
            maxTokens: 1000,
          },
        },
        preferredProvider,
      );

      if (!result.success || !result.response) {
        throw new Error(result.error?.message || 'AI request failed');
      }

      const aiResponse = result.response;
      const latency = Date.now() - startTime;

      // 解析 AI 响应
      return this.parseAIResponse(aiResponse, context, latency);
    } catch (error: any) {
      this.logger.error('AI voice order processing failed', error);
      return {
        content: '抱歉，语音识别出现问题，请重新尝试或联系客服。',
        nextStep: context.currentStep,
        isComplete: false,
        needConfirm: false,
      };
    }
  }

  /**
   * 解析 AI 响应
   */
  private parseAIResponse(
    aiResponse: any,
    context: VoiceOrderContext,
    latency: number,
  ): VoiceOrderAIResponse {
    let extractedData: any = {};
    let isComplete = false;
    let needConfirm = false;

    // 处理工具调用
    if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
      for (const toolCall of aiResponse.toolCalls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        if (functionName === 'extract_order_info') {
          extractedData = args;
        } else if (functionName === 'confirm_order') {
          isComplete = args.isComplete;
          needConfirm = true;
        }
      }
    }

    // 确定下一步
    const nextStep = this.determineNextStep(context, extractedData);

    return {
      content: aiResponse.content,
      extractedData,
      nextStep,
      isComplete,
      needConfirm,
      provider: aiResponse.provider,
      latency,
    };
  }

  /**
   * 确定下一步
   */
  private determineNextStep(
    context: VoiceOrderContext,
    extractedData: any,
  ): string {
    const collected = { ...context.collectedData, ...extractedData };

    if (!collected.itemType) {
      return 'ASK_ITEM_TYPE';
    }
    if (!collected.quantity) {
      return 'ASK_QUANTITY';
    }
    if (!collected.address) {
      return 'ASK_ADDRESS';
    }
    if (!collected.phone) {
      return 'ASK_PHONE';
    }
    if (!collected.pickupTime) {
      return 'ASK_PICKUP_TIME';
    }

    return 'CONFIRM_ORDER';
  }

  /**
   * 生成订单确认回复
   */
  async generateOrderConfirmation(
    context: VoiceOrderContext,
    preferredProvider?: AIProviderType,
  ): Promise<string> {
    const data = context.collectedData;

    const prompt = `请根据以下订单信息生成一个友好的确认消息：
物品类型：${data.itemType}
数量：${data.quantity}
取件地址：${data.address}
联系电话：${data.phone}
期望取件时间：${data.pickupTime}
备注：${data.notes || '无'}

要求：
1. 语气友好自然
2. 清晰列出所有信息
3. 询问用户是否确认提交订单`;

    const result = await this.aiService.chat(
      {
        messages: [
          { role: 'system', content: '你是专业的回收平台AI助手。' },
          { role: 'user', content: prompt },
        ],
        config: {
          temperature: 0.7,
          maxTokens: 500,
        },
      },
      preferredProvider,
    );

    if (result.success && result.response) {
      return result.response.content;
    }

    // 回退到默认模板
    return `请确认您的订单信息：
物品：${data.itemType}
数量：${data.quantity}
地址：${data.address}
电话：${data.phone}
时间：${data.pickupTime}

请问信息正确吗？`;
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(context: VoiceOrderContext): string {
    const data = context.collectedData;

    const prompt = `你是一个专业的回收平台AI助手，帮助用户通过语音创建回收订单。

当前已收集的信息：
${data.itemType ? `- 物品类型：${data.itemType}` : '- 物品类型：待收集'}
${data.quantity ? `- 数量：${data.quantity}` : '- 数量：待收集'}
${data.address ? `- 地址：${data.address}` : '- 地址：待收集'}
${data.phone ? `- 电话：${data.phone}` : '- 电话：待收集'}
${data.pickupTime ? `- 取件时间：${data.pickupTime}` : '- 取件时间：待收集'}

你的职责：
1. 从用户语音中提取关键信息（物品类型、数量、地址、电话、取件时间）
2. 如果信息不完整，主动询问缺失的信息
3. 确认所有信息收集完整后，询问用户是否提交订单
4. 保持回复简洁友好，适合语音交互

注意事项：
- 物品类型可以是：旧手机、电脑、家电、旧衣服、书籍、纸箱等
- 数量可以是：具体数量（如3部）、重量（如5公斤）、体积（如1袋）
- 地址需要详细的门牌号
- 电话需要11位手机号
- 取件时间可以是：具体日期时间、相对时间（如明天下午）`;

    return prompt;
  }

  /**
   * 获取 AI 提供商状态
   */
  getProviderStatus() {
    return this.aiService.getProviderStatus();
  }

  /**
   * 获取默认提供商
   */
  getDefaultProvider(): AIProviderType {
    return this.aiService.getDefaultProvider();
  }
}
