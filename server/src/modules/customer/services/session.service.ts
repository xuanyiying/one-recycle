import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';
import {
  ChatSession,
  ChatSessionStatus,
  ChatSessionType,
} from '@prisma/client';
import {
  CreateSessionDto,
  UpdateSessionDto,
  TransferToAgentDto,
  SubmitSatisfactionDto,
} from '../dto';

@Injectable()
export class SessionService {
  private readonly SESSION_EXPIRE_TIME = 24 * 60 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateSessionDto): Promise<ChatSession> {
    const userId = BigInt(dto.userId || '');
    if (!userId) {
      throw new BadRequestException('用户ID不能为空');
    }

    const activeSession = await this.prisma.chatSession.findFirst({
      where: {
        userId,
        status: { in: [ChatSessionStatus.ACTIVE, ChatSessionStatus.WAITING] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (activeSession) {
      return activeSession;
    }

    // AI功能已禁用：直接创建人工客服会话，不再使用AI自动回复
    const session = await this.prisma.chatSession.create({
      data: {
        userId,
        type: ChatSessionType.MANUAL, // 直接设置为人工客服模式
        topic: dto.topic,
        context: {
          ...dto.context,
          disabledAI: true, // 标记AI已禁用
          createdAt: new Date().toISOString(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            mobile: true,
          },
        },
      },
    });

    await this.cacheSession(session);

    // 直接添加到人工客服队列
    await this.addToAgentQueue(session.id.toString());

    return session;
  }

  async findOne(id: string): Promise<ChatSession | null> {
    const cached = await this.getCachedSession(id);
    if (cached) {
      return cached;
    }

    const session = await this.prisma.chatSession.findUnique({
      where: { id: BigInt(id) },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            mobile: true,
          },
        },
        agent: {
          select: {
            id: true,
            realName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (session) {
      await this.cacheSession(session);
    }

    return session;
  }

  async findByUserId(userId: string): Promise<ChatSession[]> {
    return this.prisma.chatSession.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    return this.findByUserId(userId);
  }

  async findAll(query?: any): Promise<ChatSession[]> {
    return this.prisma.chatSession.findMany({
      where: query?.userId ? { userId: BigInt(query.userId) } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateSessionDto): Promise<ChatSession> {
    const session = await this.findOne(id);
    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: BigInt(id) },
      data: {
        status: dto.status,
        topic: dto.topic,
        context: dto.context as any,
        updatedAt: new Date(),
      },
    });

    await this.cacheSession(updated);

    return updated;
  }

  async close(id: string): Promise<ChatSession> {
    const session = await this.findOne(id);
    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    const closed = await this.prisma.chatSession.update({
      where: { id: BigInt(id) },
      data: {
        status: ChatSessionStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    await this.deleteCachedSession(id);

    return closed;
  }

  async transferToAgent(
    id: string,
    dto: TransferToAgentDto,
  ): Promise<ChatSession> {
    const session = await this.findOne(id);
    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    if (session.type === ChatSessionType.MANUAL) {
      throw new BadRequestException('会话已是人工客服模式');
    }

    const queuePosition = await this.getQueuePosition(id);

    const updated = await this.prisma.chatSession.update({
      where: { id: BigInt(id) },
      data: {
        type: ChatSessionType.MANUAL,
        status: ChatSessionStatus.WAITING,
        context: {
          ...(session.context as any),
          transferReason: dto.reason,
          transferTime: new Date().toISOString(),
          queuePosition,
        },
      },
    });

    await this.addToAgentQueue(id);

    await this.cacheSession(updated);

    return updated;
  }

  async submitSatisfaction(
    id: string,
    dto: SubmitSatisfactionDto,
  ): Promise<ChatSession> {
    const session = await this.findOne(id);
    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    return this.prisma.chatSession.update({
      where: { id: BigInt(id) },
      data: {
        satisfactionRating: dto.satisfactionRating,
        feedback: dto.feedback,
      },
    });
  }

  async assignAgent(sessionId: string, agentId: string): Promise<ChatSession> {
    const session = await this.findOne(sessionId);
    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    const updated = await this.prisma.chatSession.update({
      where: { id: BigInt(sessionId) },
      data: {
        agentId: BigInt(agentId),
        status: ChatSessionStatus.ACTIVE,
      },
    });

    await this.removeFromAgentQueue(sessionId);
    await this.cacheSession(updated);

    return updated;
  }

  async getQueuePosition(sessionId: string): Promise<number> {
    const key = 'customer_service:agent_queue';
    const queue = await this.redisService.getClient().lrange(key, 0, -1);
    const index = queue.indexOf(sessionId);
    return index >= 0 ? index + 1 : 0;
  }

  async getWaitingSessions(): Promise<ChatSession[]> {
    return this.prisma.chatSession.findMany({
      where: {
        type: ChatSessionType.MANUAL,
        status: ChatSessionStatus.WAITING,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            mobile: true,
          },
        },
      },
    });
  }

  async getAgentActiveSessions(agentId: string): Promise<ChatSession[]> {
    return this.prisma.chatSession.findMany({
      where: {
        agentId: BigInt(agentId),
        status: ChatSessionStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            mobile: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  private async cacheSession(session: ChatSession): Promise<void> {
    const key = `session:${session.id}`;
    await this.redisService
      .getClient()
      .setex(key, this.SESSION_EXPIRE_TIME, JSON.stringify(session));
  }

  private async getCachedSession(id: string): Promise<ChatSession | null> {
    const key = `session:${id}`;
    const cached = await this.redisService.getClient().get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }

  private async deleteCachedSession(id: string): Promise<void> {
    const key = `session:${id}`;
    await this.redisService.getClient().del(key);
  }

  private async addToAgentQueue(sessionId: string): Promise<void> {
    const key = 'customer_service:agent_queue';
    await this.redisService.getClient().rpush(key, sessionId);
  }

  private async removeFromAgentQueue(sessionId: string): Promise<void> {
    const key = 'customer_service:agent_queue';
    await this.redisService.getClient().lrem(key, 0, sessionId);
  }
}
