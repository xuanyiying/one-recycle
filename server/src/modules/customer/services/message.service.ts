import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';
import {
  ChatMessage,
  ChatSenderType,
  ChatMessageType,
  ChatMessageStatus,
  Prisma,
} from '@prisma/client';
import { SendMessageDto, GetMessagesDto, MarkAsReadDto } from '../dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async send(
    dto: SendMessageDto,
    userId: string,
    isAgent: boolean = false,
  ): Promise<ChatMessage> {
    const sessionId = BigInt(dto.sessionId);

    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    const senderType = isAgent ? ChatSenderType.AGENT : ChatSenderType.USER;

    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        senderType,
        senderId: BigInt(userId),
        messageType: dto.messageType || ChatMessageType.TEXT,
        content: dto.content,
        mediaUrl: dto.mediaUrl,
        extraData: dto.extraData as any,
        status: ChatMessageStatus.SENT,
      },
    });

    await this.updateSessionLastMessage(sessionId, message);

    await this.publishMessageEvent('message:received', {
      sessionId: sessionId.toString(),
      message: this.formatMessage(message),
    });

    return message;
  }

  async sendSystemMessage(
    sessionId: string,
    content: string,
    extraData?: any,
  ): Promise<ChatMessage> {
    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId: BigInt(sessionId),
        senderType: ChatSenderType.SYSTEM,
        messageType: ChatMessageType.SYSTEM_NOTICE,
        content,
        extraData,
        status: ChatMessageStatus.SENT,
      },
    });

    await this.publishMessageEvent('message:received', {
      sessionId,
      message: this.formatMessage(message),
    });

    return message;
  }

  async sendAIMessage(
    sessionId: string,
    content: string,
    extraData?: any,
  ): Promise<ChatMessage> {
    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId: BigInt(sessionId),
        senderType: ChatSenderType.AI,
        messageType: ChatMessageType.TEXT,
        content,
        extraData,
        status: ChatMessageStatus.SENT,
      },
    });

    await this.publishMessageEvent('message:received', {
      sessionId,
      message: this.formatMessage(message),
    });

    return message;
  }

  async sendOrderCard(sessionId: string, orderData: any): Promise<ChatMessage> {
    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId: BigInt(sessionId),
        senderType: ChatSenderType.SYSTEM,
        messageType: ChatMessageType.ORDER_CARD,
        extraData: orderData,
        status: ChatMessageStatus.SENT,
      },
    });

    await this.publishMessageEvent('message:received', {
      sessionId,
      message: this.formatMessage(message),
    });

    return message;
  }

  async sendTicketCard(
    sessionId: string,
    ticketData: any,
  ): Promise<ChatMessage> {
    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId: BigInt(sessionId),
        senderType: ChatSenderType.SYSTEM,
        messageType: ChatMessageType.TICKET_CARD,
        extraData: ticketData,
        status: ChatMessageStatus.SENT,
      },
    });

    await this.publishMessageEvent('message:received', {
      sessionId,
      message: this.formatMessage(message),
    });

    return message;
  }

  async getMessages(dto: GetMessagesDto): Promise<{
    messages: ChatMessage[];
    hasMore: boolean;
  }> {
    const sessionId = BigInt(dto.sessionId);
    const limit = dto.limit || 20;

    const where: Prisma.ChatMessageWhereInput = {
      sessionId,
    };

    if (dto.before) {
      where.id = { lt: BigInt(dto.before) };
    }

    const messages = await this.prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop();
    }

    return {
      messages: messages.reverse(),
      hasMore,
    };
  }

  async markAsRead(dto: MarkAsReadDto): Promise<void> {
    if (dto.messageIds.length === 0) return;

    await this.prisma.chatMessage.updateMany({
      where: {
        id: { in: dto.messageIds.map((id) => BigInt(id)) },
      },
      data: {
        isRead: true,
        status: ChatMessageStatus.READ,
      },
    });
  }

  async markSessionAsRead(sessionId: string, userId: string): Promise<number> {
    const result = await this.prisma.chatMessage.updateMany({
      where: {
        sessionId: BigInt(sessionId),
        senderId: { not: BigInt(userId) },
        isRead: false,
      },
      data: {
        isRead: true,
        status: ChatMessageStatus.READ,
      },
    });

    return result.count;
  }

  async getUnreadCount(sessionId: string, userId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        sessionId: BigInt(sessionId),
        senderId: { not: BigInt(userId) },
        isRead: false,
      },
    });
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    const sessions = await this.prisma.chatSession.findMany({
      where: {
        userId: BigInt(userId),
        status: { not: 'CLOSED' },
      },
      select: { id: true },
    });

    if (sessions.length === 0) return 0;

    const sessionIds = sessions.map((s) => s.id);

    return this.prisma.chatMessage.count({
      where: {
        sessionId: { in: sessionIds },
        senderType: { not: ChatSenderType.USER },
        isRead: false,
      },
    });
  }

  private async updateSessionLastMessage(
    sessionId: bigint,
    message: ChatMessage,
  ): Promise<void> {
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        topic: message.content?.substring(0, 200),
        updatedAt: new Date(),
      },
    });
  }

  private async publishMessageEvent(event: string, data: any): Promise<void> {
    const channel = `customer_service:events`;
    await this.redisService
      .getClient()
      .publish(channel, JSON.stringify({ event, data }));
  }

  private formatMessage(message: ChatMessage): any {
    return {
      ...message,
      id: message.id.toString(),
      sessionId: message.sessionId.toString(),
      senderId: message.senderId?.toString(),
    };
  }
}
