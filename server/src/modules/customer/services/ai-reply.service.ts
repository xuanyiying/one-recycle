import { AIService, ChatMessage } from '@/modules/ai';
import { OrderService } from '@/modules/order/services/order.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

export enum UserIntent {
  ORDER_QUERY = 'ORDER_QUERY',
  ORDER_CANCEL = 'ORDER_CANCEL',
  ORDER_MODIFY = 'ORDER_MODIFY',
  ORDER_REFUND = 'ORDER_REFUND',
  LOGISTICS_QUERY = 'LOGISTICS_QUERY',
  LOGISTICS_ISSUE = 'LOGISTICS_ISSUE',
  RECYCLE_QUERY = 'RECYCLE_QUERY',
  RECYCLE_STATUS = 'RECYCLE_STATUS',
  RECYCLE_RESCHEDULE = 'RECYCLE_RESCHEDULE',
  PRICE_INQUIRY = 'PRICE_INQUIRY',
  PRICE_DISPUTE = 'PRICE_DISPUTE',
  TRANSFER_AGENT = 'TRANSFER_AGENT',
  GENERAL_QUESTION = 'GENERAL_QUESTION',
  UNKNOWN = 'UNKNOWN',
}

export interface IntentResult {
  intent: UserIntent;
  confidence: number;
  entities: {
    orderNo?: string;
    phone?: string;
    time?: string;
    reason?: string;
  };
}

export interface AIResponse {
  content: string;
  intent: UserIntent;
  confidence: number;
  needTransfer: boolean;
  extraData?: any;
  suggestedActions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
}

@Injectable()
export class AIReplyService {
  private readonly logger = new Logger(AIReplyService.name);

  private readonly intentKeywords: Map<UserIntent, string[]> = new Map([
    [
      UserIntent.ORDER_QUERY,
      ['查询订单', '订单状态', '我的订单', '订单号', '查订单', '订单查询'],
    ],
    [
      UserIntent.ORDER_CANCEL,
      ['取消订单', '不想卖了', '不要了', '撤销订单', '取消回收'],
    ],
    [
      UserIntent.ORDER_MODIFY,
      ['修改订单', '改地址', '换时间', '修改地址', '修改时间'],
    ],
    [UserIntent.ORDER_REFUND, ['退款', '退钱', '申请退款', '要退款']],
    [
      UserIntent.LOGISTICS_QUERY,
      ['物流', '快递', '到哪了', '物流查询', '快递到哪'],
    ],
    [
      UserIntent.LOGISTICS_ISSUE,
      ['物流异常', '快递问题', '没收到', '快递丢了', '物流投诉'],
    ],
    [
      UserIntent.RECYCLE_QUERY,
      ['回收预约', '预约查询', '上门回收', '回收时间'],
    ],
    [
      UserIntent.RECYCLE_STATUS,
      ['回收状态', '回收进度', '验货结果', '入库状态'],
    ],
    [
      UserIntent.RECYCLE_RESCHEDULE,
      ['改时间', '调整时间', '重新预约', '改约时间'],
    ],
    [
      UserIntent.PRICE_INQUIRY,
      ['价格', '多少钱', '回收价格', '怎么算钱', '价格查询'],
    ],
    [
      UserIntent.PRICE_DISPUTE,
      ['价格不对', '价格异议', '价格太低', '算错了', '价格投诉'],
    ],
    [
      UserIntent.TRANSFER_AGENT,
      ['转人工', '人工客服', '人工', '真人客服', '转接人工'],
    ],
  ]);

  private readonly orderNoPattern = /\d{15,20}/g;
  private readonly phonePattern = /1[3-9]\d{9}/g;

  // 会话历史记录缓存（生产环境应使用 Redis）
  private sessionHistory: Map<string, ChatMessage[]> = new Map();
  private readonly maxHistoryLength = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService,
    private readonly knowledgeService: KnowledgeService,
    private readonly aiService: AIService,
  ) {
    // 判断是否启用大模型（需要配置 OPENAI_API_KEY）
  }

  async processMessage(
    sessionId: string,
    userId: string,
    message: string,
  ): Promise<AIResponse> {
    // 如果启用大模型，使用大模型处理
    if (this.aiService.hasAvailableProvider) {
      try {
        const history = this.getSessionHistory(sessionId);

        // 构建系统提示词
        const systemPrompt = this.buildSystemPrompt();

        // 构建消息列表
        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...history,
          { role: 'user' as const, content: message },
        ];

        // 调用 AI 服务
        const result = await this.aiService.chat({
          messages,
          config: {
            temperature: 0.7,
            maxTokens: 1000,
          },
        });

        if (result.success && result.response) {
          const content = result.response.content;

          // 更新会话历史
          this.addToHistory(sessionId, { role: 'user', content: message });
          this.addToHistory(sessionId, { role: 'assistant', content });

          // 记录对话
          this.logConversation(sessionId, userId, message, {
            intent: UserIntent.GENERAL_QUESTION,
            confidence: 0.9,
            entities: {},
          });

          return {
            content,
            intent: UserIntent.GENERAL_QUESTION,
            confidence: 0.9,
            needTransfer: false,
          };
        }
      } catch (error) {
        this.logger.error(
          'LLM processing failed, fallback to traditional method',
          error,
        );
      }
    }

    // 传统基于关键词的意图识别方法
    const intentResult = await this.detectIntent(message);

    await this.logConversation(sessionId, userId, message, intentResult);

    let response: AIResponse;

    switch (intentResult.intent) {
      case UserIntent.ORDER_QUERY:
        response = await this.handleOrderQuery(userId, intentResult);
        break;
      case UserIntent.ORDER_CANCEL:
        response = await this.handleOrderCancel(userId, intentResult);
        break;
      case UserIntent.ORDER_MODIFY:
        response = await this.handleOrderModify(userId, intentResult);
        break;
      case UserIntent.LOGISTICS_QUERY:
        response = await this.handleLogisticsQuery(userId, intentResult);
        break;
      case UserIntent.RECYCLE_QUERY:
        response = await this.handleRecycleQuery(userId, intentResult);
        break;
      case UserIntent.PRICE_INQUIRY:
        response = await this.handlePriceInquiry(intentResult);
        break;
      case UserIntent.TRANSFER_AGENT:
        response = this.handleTransferAgent();
        break;
      case UserIntent.GENERAL_QUESTION:
        response = await this.handleGeneralQuestion(message, intentResult);
        break;
      default:
        response = this.handleUnknownIntent(message, intentResult);
    }

    return response;
  }

  /**
   * 获取会话历史记录
   */
  private getSessionHistory(sessionId: string): ChatMessage[] {
    return this.sessionHistory.get(sessionId) || [];
  }

  /**
   * 添加消息到历史记录
   */
  private addToHistory(sessionId: string, message: ChatMessage): void {
    const history = this.getSessionHistory(sessionId);
    history.push(message);

    // 限制历史长度
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

  private async detectIntent(message: string): Promise<IntentResult> {
    const entities = this.extractEntities(message);

    let maxScore = 0;
    let detectedIntent = UserIntent.UNKNOWN;

    for (const [intent, keywords] of this.intentKeywords) {
      let score = 0;
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          score += keyword.length;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }

    const knowledgeMatch = await this.knowledgeService.matchIntent(message);
    if (knowledgeMatch && knowledgeMatch.confidence > 0.7) {
      return {
        intent: knowledgeMatch.intent as UserIntent,
        confidence: knowledgeMatch.confidence,
        entities,
      };
    }

    const confidence = maxScore > 0 ? Math.min(maxScore / 10, 0.95) : 0.3;

    return {
      intent: detectedIntent,
      confidence,
      entities,
    };
  }

  private extractEntities(message: string): IntentResult['entities'] {
    const entities: IntentResult['entities'] = {};

    const orderNoMatch = message.match(this.orderNoPattern);
    if (orderNoMatch) {
      entities.orderNo = orderNoMatch[0];
    }

    const phoneMatch = message.match(this.phonePattern);
    if (phoneMatch) {
      entities.phone = phoneMatch[0];
    }

    const timePatterns = [
      /(\d{1,2})[点时](\d{1,2})?/,
      /(上午|下午|晚上|早上|中午)/,
      /(\d{1,2})[月](\d{1,2})[日号]/,
    ];

    for (const pattern of timePatterns) {
      const match = message.match(pattern);
      if (match) {
        entities.time = match[0];
        break;
      }
    }

    return entities;
  }

  private async handleOrderQuery(
    userId: string,
    intentResult: IntentResult,
  ): Promise<AIResponse> {
    try {
      let orders: any[] = [];

      if (intentResult.entities.orderNo) {
        const order = await this.orderService.findById(
          parseInt(intentResult.entities.orderNo, 10),
        );
        if (order && order.userId.toString() === userId) {
          orders = [order];
        }
      } else {
        const result = await this.orderService.findAll({ userId });
        orders = result.orders.slice(0, 5);
      }

      if (orders.length === 0) {
        return {
          content:
            '抱歉，没有找到您的订单记录。请问您要查询的订单号是多少？或者您可以提供下单时使用的手机号。',
          intent: UserIntent.ORDER_QUERY,
          confidence: intentResult.confidence,
          needTransfer: false,
          suggestedActions: [
            { type: 'input', label: '输入订单号' },
            { type: 'input', label: '输入手机号' },
          ],
        };
      }

      const orderCards = orders.map((order) => ({
        orderNo: order.orderNo,
        status: order.status,
        createdAt: order.createdAt,
        estimatedAmount: order.estimatedAmount,
      }));

      return {
        content: `为您找到 ${orders.length} 个订单：`,
        intent: UserIntent.ORDER_QUERY,
        confidence: intentResult.confidence,
        needTransfer: false,
        extraData: { orders: orderCards },
        suggestedActions: orders.map((order) => ({
          type: 'order_card',
          label: `订单 ${order.orderNo}`,
          data: { orderId: order.id },
        })),
      };
    } catch (error) {
      this.logger.error('Order query failed', error);
      return {
        content: '查询订单时出现错误，请稍后再试或转接人工客服。',
        intent: UserIntent.ORDER_QUERY,
        confidence: intentResult.confidence,
        needTransfer: true,
      };
    }
  }

  private async handleOrderCancel(
    userId: string,
    intentResult: IntentResult,
  ): Promise<AIResponse> {
    try {
      const result = await this.orderService.findAll({
        userId,
        status: 'PENDING' as any,
      });

      const cancellableOrders = result.orders.filter(
        (o) => o.status === 'PENDING' || o.status === 'PENDING_PICKUP',
      );

      if (cancellableOrders.length === 0) {
        return {
          content:
            '您当前没有可取消的订单。只有待处理或待取件状态的订单可以取消。',
          intent: UserIntent.ORDER_CANCEL,
          confidence: intentResult.confidence,
          needTransfer: false,
        };
      }

      return {
        content: '以下订单可以取消，请选择要取消的订单：',
        intent: UserIntent.ORDER_CANCEL,
        confidence: intentResult.confidence,
        needTransfer: false,
        extraData: { orders: cancellableOrders },
        suggestedActions: cancellableOrders.map((order) => ({
          type: 'cancel_order',
          label: `取消订单 ${order.orderNo}`,
          data: { orderId: order.id },
        })),
      };
    } catch (error) {
      this.logger.error('Order cancel query failed', error);
      return {
        content: '查询可取消订单时出现错误，请稍后再试。',
        intent: UserIntent.ORDER_CANCEL,
        confidence: intentResult.confidence,
        needTransfer: false,
      };
    }
  }

  private async handleOrderModify(
    userId: string,
    intentResult: IntentResult,
    page: number = 1,
    limit: number = 3,
  ): Promise<AIResponse> {
    try {
      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.min(Math.max(1, limit), 50);

      // 获取用户最近的订单
      const { orders } = await this.orderService.findAll(
        {
          userId,
        },
        validatedPage,
        validatedLimit,
      );

      let content =
        '好的，我可以帮您修改订单信息。请问您要修改什么内容？\n\n1. 修改收货地址\n2. 修改上门时间\n3. 修改其他信息\n\n请回复对应的数字或描述您的需求。';

      // 如果有进行中的订单，提供具体信息
      const activeOrder = orders.find(
        (o: { status: string }) =>
          o.status === 'PENDING' ||
          o.status === 'PENDING_PICKUP' ||
          o.status === 'IN_TRANSIT',
      );

      if (activeOrder) {
        const statusText =
          activeOrder.status === 'PENDING'
            ? '待处理'
            : activeOrder.status === 'PENDING_PICKUP'
              ? '待取件'
              : '运输中';
        content = `好的，我可以帮您修改订单 **#${activeOrder.orderNo}**（${statusText}）。\n\n请问您要修改什么内容？\n\n1. 修改收货地址\n2. 修改上门时间\n3. 修改其他信息\n\n请回复对应的数字或描述您的需求。`;
      } else if (orders.length > 0) {
        content = `我注意到您有 ${orders.length} 个历史订单。如果您想修改最近的订单，请告诉我订单号，或者选择：\n\n1. 查询所有订单\n2. 创建新订单\n3. 联系人工客服`;
      }

      return {
        content,
        intent: UserIntent.ORDER_MODIFY,
        confidence: intentResult.confidence,
        needTransfer: false,
        suggestedActions: activeOrder
          ? [
              { type: 'modify_address', label: '修改地址' },
              { type: 'modify_time', label: '修改时间' },
              { type: 'modify_other', label: '其他修改' },
            ]
          : [
              { type: 'query_orders', label: '查询订单' },
              { type: 'create_order', label: '创建新订单' },
              { type: 'transfer_agent', label: '联系客服' },
            ],
      };
    } catch (error) {
      // 记录错误日志以便调试和监控
      this.logger.error(
        `Order modify query failed for user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );

      // 如果查询失败，返回默认响应
      return {
        content:
          '好的，我可以帮您修改订单信息。请问您要修改什么内容？\n\n1. 修改收货地址\n2. 修改上门时间\n3. 修改其他信息\n\n请回复对应的数字或描述您的需求。',
        intent: UserIntent.ORDER_MODIFY,
        confidence: intentResult.confidence,
        needTransfer: false,
        suggestedActions: [
          { type: 'modify_address', label: '修改地址' },
          { type: 'modify_time', label: '修改时间' },
          { type: 'modify_other', label: '其他修改' },
        ],
      };
    }
  }

  private async handleLogisticsQuery(
    userId: string,
    intentResult: IntentResult,
  ): Promise<AIResponse> {
    try {
      const result = await this.orderService.findAll({
        userId,
        status: 'IN_TRANSIT' as any,
      });

      const inTransitOrders = result.orders.filter(
        (o) => o.status === 'PICKED_UP' || o.status === 'IN_TRANSIT',
      );

      if (inTransitOrders.length === 0) {
        return {
          content:
            '您当前没有运输中的订单。如需查询其他订单状态，请告诉我订单号。',
          intent: UserIntent.LOGISTICS_QUERY,
          confidence: intentResult.confidence,
          needTransfer: false,
        };
      }

      return {
        content: '以下订单正在运输中：',
        intent: UserIntent.LOGISTICS_QUERY,
        confidence: intentResult.confidence,
        needTransfer: false,
        extraData: { orders: inTransitOrders },
        suggestedActions: inTransitOrders.map((order) => ({
          type: 'logistics_detail',
          label: `查看物流 ${order.orderNo}`,
          data: { orderId: order.id },
        })),
      };
    } catch (error) {
      this.logger.error('Logistics query failed', error);
      return {
        content: '查询物流信息时出现错误，请稍后再试。',
        intent: UserIntent.LOGISTICS_QUERY,
        confidence: intentResult.confidence,
        needTransfer: false,
      };
    }
  }

  private async handleRecycleQuery(
    userId: string,
    intentResult: IntentResult,
  ): Promise<AIResponse> {
    try {
      const result = await this.orderService.findAll({ userId });

      const recycleOrders = result.orders.filter(
        (o) =>
          o.status === 'PENDING' ||
          o.status === 'PENDING_PICKUP' ||
          o.status === 'INSPECTING',
      );

      if (recycleOrders.length === 0) {
        return {
          content:
            '您当前没有进行中的回收订单。\n\n如需预约回收，请点击首页的"一键预约"按钮。如需查询历史订单，请告诉我订单号。',
          intent: UserIntent.RECYCLE_QUERY,
          confidence: intentResult.confidence,
          needTransfer: false,
          suggestedActions: [{ type: 'new_order', label: '预约回收' }],
        };
      }

      return {
        content: '您的回收订单状态如下：',
        intent: UserIntent.RECYCLE_QUERY,
        confidence: intentResult.confidence,
        needTransfer: false,
        extraData: { orders: recycleOrders },
      };
    } catch (error) {
      this.logger.error('Recycle query failed', error);
      return {
        content: '查询回收订单时出现错误，请稍后再试。',
        intent: UserIntent.RECYCLE_QUERY,
        confidence: intentResult.confidence,
        needTransfer: false,
      };
    }
  }

  private async handlePriceInquiry(
    intentResult: IntentResult,
  ): Promise<AIResponse> {
    const categories = await this.prisma.category.findMany({
      where: { isVisible: true },
      select: { id: true, name: true, priceInfo: true },
      take: 10,
    });

    return {
      content:
        '以下是常见回收物品的价格参考：\n\n实际价格会根据物品成色、重量等因素确定，具体以验货结果为准。',
      intent: UserIntent.PRICE_INQUIRY,
      confidence: intentResult.confidence,
      needTransfer: false,
      extraData: { categories },
      suggestedActions: [{ type: 'price_detail', label: '查看详细价格表' }],
    };
  }

  private handleTransferAgent(): AIResponse {
    return {
      content:
        '好的，正在为您转接人工客服，请稍候...\n\n当前排队人数：正在查询\n预计等待时间：约2-5分钟',
      intent: UserIntent.TRANSFER_AGENT,
      confidence: 1,
      needTransfer: true,
    };
  }

  private async handleGeneralQuestion(
    message: string,
    intentResult: IntentResult,
  ): Promise<AIResponse> {
    const knowledgeMatch = await this.knowledgeService.search(message);

    if (knowledgeMatch) {
      await this.knowledgeService.incrementHitCount(knowledgeMatch.id);

      return {
        content: knowledgeMatch.answer,
        intent: UserIntent.GENERAL_QUESTION,
        confidence: 0.85,
        needTransfer: false,
        suggestedActions: [
          { type: 'helpful', label: '有帮助' },
          { type: 'not_helpful', label: '没帮助' },
          { type: 'transfer', label: '转人工' },
        ],
      };
    }

    return this.handleUnknownIntent(message, intentResult);
  }

  private handleUnknownIntent(
    message: string,
    intentResult: IntentResult,
  ): AIResponse {
    // 基于用户消息内容提供更智能的响应
    const normalizedMessage = message.toLowerCase().trim();

    // 根据消息内容推断可能的意图
    let content = '抱歉，我没有完全理解您的问题。';
    const quickQuestions = [
      '查询订单状态',
      '取消订单',
      '修改上门时间',
      '回收价格查询',
      '物流查询',
      '转人工客服',
    ];

    // 关键词匹配提供更相关的建议
    if (
      normalizedMessage.includes('价格') ||
      normalizedMessage.includes('多少钱') ||
      normalizedMessage.includes('怎么收费')
    ) {
      content =
        '您似乎想了解回收价格。不同品类的回收价格不同，您可以：\n\n1. 查看价格表\n2. 使用估价工具\n3. 咨询具体品类价格';
    } else if (
      normalizedMessage.includes('时间') ||
      normalizedMessage.includes('什么时候') ||
      normalizedMessage.includes('几点')
    ) {
      content =
        '您可能在询问时间安排。我可以帮您：\n\n1. 查询上门时间\n2. 修改预约时间\n3. 查看服务时间';
    } else if (
      normalizedMessage.includes('地址') ||
      normalizedMessage.includes('在哪') ||
      normalizedMessage.includes('位置')
    ) {
      content =
        '您可能在询问地址相关问题。我可以帮您：\n\n1. 查看当前地址\n2. 修改收货地址\n3. 查询服务范围';
    } else if (
      normalizedMessage.includes('谢谢') ||
      normalizedMessage.includes('感谢')
    ) {
      content = '不客气！很高兴能为您服务。如果您还有其他问题，随时告诉我。';
      return {
        content,
        intent: UserIntent.GENERAL_QUESTION,
        confidence: intentResult.confidence,
        needTransfer: false,
        suggestedActions: [
          { type: 'new_question', label: '还有其他问题' },
          { type: 'end_chat', label: '结束对话' },
        ],
      };
    } else if (
      normalizedMessage.includes('投诉') ||
      normalizedMessage.includes('不满') ||
      normalizedMessage.includes('问题')
    ) {
      content =
        '非常抱歉给您带来不好的体验。我会立即为您转接人工客服处理您的问题。';
      return {
        content,
        intent: UserIntent.UNKNOWN,
        confidence: intentResult.confidence,
        needTransfer: true,
        suggestedActions: [{ type: 'transfer_agent', label: '转人工客服' }],
      };
    } else {
      content = `抱歉，我没有完全理解"${message.slice(0, 20)}${message.length > 20 ? '...' : ''}"。请问您是想：`;
    }

    return {
      content,
      intent: UserIntent.UNKNOWN,
      confidence: intentResult.confidence,
      needTransfer: false,
      suggestedActions: quickQuestions.map((q) => ({
        type: 'quick_question',
        label: q,
      })),
    };
  }

  private logConversation(
    sessionId: string,
    userId: string,
    message: string,
    intentResult: IntentResult,
  ): void {
    // AIConversationLog model has been removed from Prisma schema
    // TODO: Re-enable when AI conversation logging is needed
    void sessionId;
    void userId;
    void message;
    void intentResult;
    try {
      this.logger.debug('Conversation logging is currently disabled');
    } catch (error) {
      this.logger.error('Failed to log conversation', error);
    }
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(): string {
    return `你是一个专业的回收平台AI客服助手，帮助用户解决订单查询、回收预约、价格咨询等问题。

你的职责：
1. 友好、专业地回答用户问题
2. 如果用户问题无法解决，建议转接人工客服
3. 保持回复简洁明了

注意事项：
- 订单查询需要订单号或手机号
- 取消订单需要订单处于待处理状态
- 价格咨询时说明需要现场验货才能确定准确价格
- 保持礼貌和耐心`;
  }
}
