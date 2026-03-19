/**
 * 基于统一 AI 服务的智能客服实现
 * 支持多平台大模型，自动故障转移
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  AIService,
  AIProviderType,
  ChatMessage,
  ToolDefinition,
} from '@/modules/ai';
import { OrderService } from '@/modules/order/services/order.service';
import { KnowledgeService } from './knowledge.service';

export interface CustomerToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface CustomerAIResponse {
  content: string;
  toolCalls?: any[];
  needTransfer: boolean;
  extraData?: any;
  suggestedActions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
  provider?: AIProviderType;
  latency?: number;
}

@Injectable()
export class AICustomerService {
  private readonly logger = new Logger(AICustomerService.name);

  // 定义可用的工具
  private readonly tools: ToolDefinition[] = [
    {
      type: 'function',
      function: {
        name: 'query_order',
        description: '查询用户订单信息，支持按订单号查询或查询用户的所有订单',
        parameters: {
          type: 'object',
          properties: {
            orderNo: {
              type: 'string',
              description: '订单号，如果用户提供了具体的订单号则使用',
            },
            queryType: {
              type: 'string',
              enum: ['by_order_no', 'all_orders'],
              description: '查询类型：按订单号查询或查询所有订单',
            },
          },
          required: ['queryType'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'cancel_order',
        description: '取消用户的订单，只有待处理或待取件状态的订单可以取消',
        parameters: {
          type: 'object',
          properties: {
            orderNo: {
              type: 'string',
              description: '要取消的订单号',
            },
            reason: {
              type: 'string',
              description: '取消原因',
            },
          },
          required: ['orderNo'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'query_recycle_status',
        description: '查询回收订单的状态和进度',
        parameters: {
          type: 'object',
          properties: {
            orderNo: {
              type: 'string',
              description: '回收订单号',
            },
          },
          required: ['orderNo'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'query_price',
        description: '查询回收物品的价格信息',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: '物品类别，如：手机、电脑、家电等',
            },
            brand: {
              type: 'string',
              description: '品牌，如：苹果、华为、小米等',
            },
            model: {
              type: 'string',
              description: '型号',
            },
          },
          required: ['category'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'search_knowledge',
        description: '搜索知识库，回答用户的常见问题',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '用户的问题',
            },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'transfer_to_agent',
        description: '当用户要求转人工客服或问题无法自动解决时，转接到人工客服',
        parameters: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              description: '转人工的原因',
            },
          },
          required: ['reason'],
        },
      },
    },
  ];

  // 会话历史记录
  private sessionHistory: Map<string, ChatMessage[]> = new Map();
  private readonly maxHistoryLength = 10;

  constructor(
    private readonly aiService: AIService,
    private readonly orderService: OrderService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  /**
   * 处理用户消息
   */
  async processMessage(
    sessionId: string,
    userId: string,
    message: string,
    preferredProvider?: AIProviderType,
  ): Promise<CustomerAIResponse> {
    const startTime = Date.now();

    try {
      // 检查是否有可用的 AI 提供商
      if (!this.aiService.hasAvailableProvider) {
        this.logger.warn('No AI provider available');
        return {
          content: '抱歉，AI 服务暂时不可用，请稍后再试或转接人工客服。',
          needTransfer: true,
        };
      }

      // 构建系统提示词
      const systemPrompt = this.buildSystemPrompt();

      // 获取会话历史
      const history = this.getSessionHistory(sessionId);

      // 构建消息列表
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ];

      // 调用 AI 服务
      const result = await this.aiService.chat(
        {
          messages,
          tools: this.tools,
          toolChoice: 'auto',
          config: {
            temperature: 0.7,
            maxTokens: 2000,
          },
        },
        preferredProvider,
      );

      if (!result.success || !result.response) {
        throw new Error(result.error?.message || 'AI request failed');
      }

      const aiResponse = result.response;
      const latency = Date.now() - startTime;

      // 更新会话历史
      this.addToHistory(sessionId, { role: 'user', content: message });

      // 检查是否需要调用工具
      if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
        const toolResult = await this.handleToolCalls(
          userId,
          aiResponse.toolCalls,
          messages,
          preferredProvider,
        );

        return {
          ...toolResult,
          provider: aiResponse.provider,
          latency,
        };
      }

      // 直接返回 AI 回复
      this.addToHistory(sessionId, {
        role: 'assistant',
        content: aiResponse.content,
      });

      return {
        content: aiResponse.content,
        needTransfer: false,
        provider: aiResponse.provider,
        latency,
      };
    } catch (error: any) {
      this.logger.error('AI customer service failed', error);
      return {
        content: '抱歉，服务暂时出现问题，请稍后再试或转接人工客服。',
        needTransfer: true,
      };
    }
  }

  /**
   * 处理工具调用
   */
  private async handleToolCalls(
    userId: string,
    toolCalls: any[],
    messages: ChatMessage[],
    preferredProvider?: AIProviderType,
  ): Promise<CustomerAIResponse> {
    // 执行所有工具调用
    const toolResults: CustomerToolResult[] = [];
    let needTransfer = false;
    let extraData: any = null;

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      this.logger.log(`Executing tool: ${functionName}`, functionArgs);

      const result = await this.executeTool(userId, functionName, functionArgs);
      toolResults.push(result);

      if (functionName === 'transfer_to_agent') {
        needTransfer = true;
      }

      if (result.data) {
        extraData = result.data;
      }
    }

    // 将工具结果添加到消息列表
    const toolMessages: ChatMessage[] = toolCalls.map((toolCall, index) => ({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: JSON.stringify(toolResults[index]),
    }));

    // 再次调用 AI 生成回复
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      tool_calls: toolCalls,
    };

    const finalMessages: ChatMessage[] = [
      ...messages,
      assistantMessage,
      ...toolMessages,
    ];

    const result = await this.aiService.chat(
      {
        messages: finalMessages,
        config: {
          temperature: 0.7,
          maxTokens: 2000,
        },
      },
      preferredProvider,
    );

    if (!result.success || !result.response) {
      return {
        content: '处理请求时出现错误，请稍后再试。',
        needTransfer: true,
      };
    }

    // 生成建议操作
    const suggestedActions = this.generateSuggestedActions(
      toolCalls,
      extraData,
    );

    return {
      content: result.response.content,
      needTransfer,
      extraData,
      suggestedActions,
      provider: result.response.provider,
    };
  }

  /**
   * 执行工具
   */
  private async executeTool(
    userId: string,
    functionName: string,
    args: any,
  ): Promise<CustomerToolResult> {
    try {
      switch (functionName) {
        case 'query_order':
          return await this.handleQueryOrder(userId, args);

        case 'cancel_order':
          return await this.handleCancelOrder(userId, args);

        case 'query_recycle_status':
          return await this.handleQueryRecycleStatus(userId, args);

        case 'query_price':
          return await this.handleQueryPrice(args);

        case 'search_knowledge':
          return await this.handleSearchKnowledge(args);

        case 'transfer_to_agent':
          return {
            success: true,
            data: { reason: args.reason },
          };

        default:
          return {
            success: false,
            error: `Unknown function: ${functionName}`,
          };
      }
    } catch (error: any) {
      this.logger.error(`Tool execution failed: ${functionName}`, error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * 处理订单查询
   */
  private async handleQueryOrder(
    userId: string,
    args: any,
  ): Promise<CustomerToolResult> {
    try {
      if (args.queryType === 'by_order_no' && args.orderNo) {
        const orderId = parseInt(args.orderNo, 10);
        if (isNaN(orderId)) {
          return {
            success: false,
            error: '订单号格式不正确',
          };
        }

        const order = await this.orderService.findById(orderId);
        if (!order) {
          return {
            success: false,
            error: '未找到该订单',
          };
        }

        if (order.userId.toString() !== userId) {
          return {
            success: false,
            error: '您没有权限查看该订单',
          };
        }

        return {
          success: true,
          data: {
            orders: [this.formatOrder(order)],
          },
        };
      } else {
        const result = await this.orderService.findAll({ userId }, 1, 10);

        return {
          success: true,
          data: {
            orders: result.orders.map((order) => this.formatOrder(order)),
            total: result.total,
          },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 处理订单取消
   */
  private async handleCancelOrder(
    userId: string,
    args: any,
  ): Promise<CustomerToolResult> {
    try {
      const orderId = parseInt(args.orderNo, 10);
      if (isNaN(orderId)) {
        return {
          success: false,
          error: '订单号格式不正确',
        };
      }

      const order = await this.orderService.findById(orderId);
      if (!order) {
        return {
          success: false,
          error: '未找到该订单',
        };
      }

      if (order.userId.toString() !== userId) {
        return {
          success: false,
          error: '您没有权限取消该订单',
        };
      }

      const cancellableStatuses = ['PENDING', 'PENDING_PICKUP'];
      if (!cancellableStatuses.includes(order.status)) {
        return {
          success: false,
          error: `订单当前状态为 ${order.status}，无法取消`,
        };
      }

      await this.orderService.update(orderId, {
        status: 'CANCELLED' as any,
      });

      return {
        success: true,
        data: {
          orderNo: args.orderNo,
          message: '订单已成功取消',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 处理回收状态查询
   */
  private async handleQueryRecycleStatus(
    userId: string,
    args: any,
  ): Promise<CustomerToolResult> {
    const result = await this.handleQueryOrder(userId, {
      queryType: 'by_order_no',
      orderNo: args.orderNo,
    });

    if (!result.success) {
      return result;
    }

    const order = result.data.orders[0];
    return {
      success: true,
      data: {
        ...order,
        statusDescription: this.getStatusDescription(order.status),
        nextSteps: this.getNextSteps(order.status),
      },
    };
  }

  /**
   * 处理价格查询
   */
  private async handleQueryPrice(args: any): Promise<CustomerToolResult> {
    return {
      success: true,
      data: {
        category: args.category,
        brand: args.brand,
        model: args.model,
        priceRange: '价格需要根据具体品相评估',
        note: '请预约上门回收，工作人员会现场验货并给出准确报价',
      },
    };
  }

  /**
   * 处理知识库搜索
   */
  private async handleSearchKnowledge(args: any): Promise<CustomerToolResult> {
    const result = await this.knowledgeService.matchIntent(args.query);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 格式化订单数据
   */
  private formatOrder(order: any): any {
    return {
      orderNo: order.orderNo || order.id.toString(),
      status: order.status,
      statusText: this.getStatusText(order.status),
      createdAt: order.createdAt,
      estimatedAmount: order.estimatedAmount,
      actualAmount: order.actualAmount,
      itemCount: order.items?.length || 0,
      address: order.address
        ? `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`
        : null,
      expectPickupTime: order.expectPickupTime,
    };
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: '待处理',
      PENDING_PICKUP: '待取件',
      PICKED_UP: '已取件',
      IN_INSPECTION: '验货中',
      INSPECTED: '已验货',
      PAID: '已付款',
      COMPLETED: '已完成',
      CANCELLED: '已取消',
      REFUNDED: '已退款',
    };
    return statusMap[status] || status;
  }

  /**
   * 获取状态描述
   */
  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      PENDING: '您的订单已提交，正在等待工作人员处理',
      PENDING_PICKUP: '订单已分配，快递员即将上门取件',
      PICKED_UP: '物品已取件，正在运送至仓库',
      IN_INSPECTION: '物品正在验货，请耐心等待',
      INSPECTED: '验货完成，等待确认价格',
      PAID: '款项已支付，请注意查收',
      COMPLETED: '订单已完成，感谢您的使用',
      CANCELLED: '订单已取消',
    };
    return descriptions[status] || '';
  }

  /**
   * 获取下一步操作
   */
  private getNextSteps(status: string): string[] {
    const steps: Record<string, string[]> = {
      PENDING: ['等待工作人员联系', '准备待回收物品'],
      PENDING_PICKUP: ['准备好物品', '等待快递员上门'],
      PICKED_UP: ['等待验货结果'],
      IN_INSPECTION: ['等待验货完成'],
      INSPECTED: ['查看验货结果', '确认价格'],
      PAID: ['查收款项'],
      COMPLETED: ['评价服务'],
    };
    return steps[status] || [];
  }

  /**
   * 生成建议操作
   */
  private generateSuggestedActions(
    toolCalls: any[],
    extraData: any,
  ): Array<{ type: string; label: string; data?: any }> {
    const actions: Array<{ type: string; label: string; data?: any }> = [];

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;

      switch (functionName) {
        case 'query_order':
          if (extraData?.orders?.length > 0) {
            extraData.orders.forEach((order: any) => {
              actions.push({
                type: 'view_order',
                label: `查看订单 ${order.orderNo}`,
                data: { orderNo: order.orderNo },
              });
            });
          }
          break;

        case 'cancel_order':
          if (extraData?.orders?.length > 0) {
            const cancellableOrders = extraData.orders.filter(
              (o: any) =>
                o.status === 'PENDING' || o.status === 'PENDING_PICKUP',
            );
            cancellableOrders.forEach((order: any) => {
              actions.push({
                type: 'cancel_order',
                label: `取消订单 ${order.orderNo}`,
                data: { orderNo: order.orderNo },
              });
            });
          }
          break;

        case 'transfer_to_agent':
          actions.push({
            type: 'transfer',
            label: '转接人工客服',
            data: {},
          });
          break;
      }
    }

    return actions;
  }

  /**
   * 获取会话历史
   */
  private getSessionHistory(sessionId: string): ChatMessage[] {
    return this.sessionHistory.get(sessionId) || [];
  }

  /**
   * 添加消息到历史
   */
  private addToHistory(sessionId: string, message: ChatMessage): void {
    const history = this.getSessionHistory(sessionId);
    history.push(message);

    if (history.length > this.maxHistoryLength) {
      history.shift();
    }

    this.sessionHistory.set(sessionId, history);
  }

  /**
   * 清除会话历史
   */
  clearSessionHistory(sessionId: string): void {
    this.sessionHistory.delete(sessionId);
  }

  /**
   * 获取 AI 提供商状态
   */
  getProviderStatus() {
    return this.aiService.getProviderStatus();
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(): string {
    return `你是一个专业的回收平台AI助手，帮助用户解决订单查询、回收预约、价格咨询等问题。

你的职责：
1. 友好、专业地回答用户问题
2. 使用工具获取准确信息，不要编造数据
3. 如果用户问题无法解决，主动转接人工客服
4. 保持回复简洁明了

订单状态说明：
- PENDING: 待处理
- PENDING_PICKUP: 待取件
- PICKED_UP: 已取件
- IN_INSPECTION: 验货中
- INSPECTED: 已验货
- PAID: 已付款
- COMPLETED: 已完成
- CANCELLED: 已取消

注意事项：
- 查询订单时优先使用用户提供的订单号
- 取消订单前确认订单状态是否允许取消
- 价格咨询时说明需要现场验货才能确定准确价格
- 保持礼貌和耐心`;
  }
}
