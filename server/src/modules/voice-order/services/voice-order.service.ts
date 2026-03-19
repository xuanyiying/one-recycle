import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';
import {
  VoiceOrderSession,
  SessionStatus,
  DialogMessage,
} from '../interfaces/voice-order.interface';
import { DialogStep, CreateVoiceOrderSessionDto } from '../dto/voice-input.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VoiceOrderService {
  private readonly logger = new Logger(VoiceOrderService.name);
  private readonly SESSION_CACHE_TTL = 1800; // 30 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 创建新的语音下单会话
   */
  async createSession(
    dto: CreateVoiceOrderSessionDto,
  ): Promise<VoiceOrderSession> {
    const sessionId = uuidv4();
    // 使用 0 作为匿名用户的 ID，因为数据库要求 BigInt 类型
    const userId = dto.userId || '0';

    const session: VoiceOrderSession = {
      id: sessionId,
      userId,
      currentStep: DialogStep.GREETING,
      collectedData: {},
      context: {
        retryCount: 0,
        skippedSteps: [],
      },
      status: SessionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 缓存到 Redis
    await this.cacheSession(session);

    // 持久化到数据库
    await this.prisma.voiceOrderSession.create({
      data: {
        id: sessionId,
        userId: BigInt(userId),
        currentStep: DialogStep.GREETING,
        collectedData: session.collectedData as any,
        context: session.context as any,
        status: SessionStatus.ACTIVE,
      },
    });

    this.logger.log(
      `Created new voice order session: ${sessionId} for user ${userId}`,
    );
    return session;
  }

  /**
   * 获取会话
   */
  async getSession(sessionId: string): Promise<VoiceOrderSession> {
    // 先从缓存获取
    const cached = await this.getCachedSession(sessionId);
    if (cached) {
      return cached;
    }

    // 从数据库获取
    const dbSession = await this.prisma.voiceOrderSession.findUnique({
      where: { id: sessionId },
    });

    if (!dbSession) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    const session: VoiceOrderSession = {
      id: dbSession.id,
      userId: dbSession.userId.toString(),
      currentStep: dbSession.currentStep as DialogStep,
      status: dbSession.status as SessionStatus,
      collectedData: dbSession.collectedData as any,
      context: dbSession.context as any,
      orderNo: dbSession.orderNo || undefined,
      createdAt: dbSession.createdAt,
      updatedAt: dbSession.updatedAt,
      completedAt: dbSession.completedAt || undefined,
    };

    // 重新缓存
    await this.cacheSession(session);

    return session;
  }

  /**
   * 更新会话状态
   */
  async updateSession(
    sessionId: string,
    update: Partial<VoiceOrderSession>,
  ): Promise<VoiceOrderSession> {
    const session = await this.getSession(sessionId);

    const updatedSession: VoiceOrderSession = {
      ...session,
      ...update,
      updatedAt: new Date(),
    };

    // 更新缓存
    await this.cacheSession(updatedSession);

    // 更新数据库
    await this.prisma.voiceOrderSession.update({
      where: { id: sessionId },
      data: {
        currentStep: updatedSession.currentStep,
        collectedData: updatedSession.collectedData as any,
        context: updatedSession.context as any,
        status: updatedSession.status,
        orderNo: updatedSession.orderNo,
        completedAt: updatedSession.completedAt,
      },
    });

    return updatedSession;
  }

  /**
   * 结束会话
   */
  async endSession(
    sessionId: string,
    status: SessionStatus = SessionStatus.COMPLETED,
    orderNo?: string,
  ): Promise<void> {
    await this.getSession(sessionId);

    await this.prisma.voiceOrderSession.update({
      where: { id: sessionId },
      data: {
        status,
        orderNo,
        completedAt: status === SessionStatus.COMPLETED ? new Date() : null,
      },
    });

    // 从缓存中删除
    await this.removeFromCache(sessionId);

    this.logger.log(`Ended session ${sessionId} with status ${status}`);
  }

  /**
   * 添加对话消息日志
   */
  async logMessage(
    sessionId: string,
    userId: string,
    message: DialogMessage,
    recognizedText?: string,
    intent?: string,
    entities?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.voiceRecognitionLog.create({
        data: {
          sessionId,
          userId: BigInt(userId),
          step: message.step || 'UNKNOWN',
          recognizedText: recognizedText || message.text,
          intent: intent || null,
          entities: entities || undefined,
          status: 'SUCCESS',
        },
      });
    } catch (error) {
      this.logger.error('Failed to log message', error);
    }
  }

  /**
   * 缓存会话到 Redis
   */
  private async cacheSession(session: VoiceOrderSession): Promise<void> {
    const key = `voice:session:${session.id}`;
    await this.redisService
      .getClient()
      .setex(key, this.SESSION_CACHE_TTL, JSON.stringify(session));
  }

  /**
   * 从缓存获取会话
   */
  private async getCachedSession(
    sessionId: string,
  ): Promise<VoiceOrderSession | null> {
    const key = `voice:session:${sessionId}`;
    const cached = await this.redisService.getClient().get(key);
    if (cached) {
      return JSON.parse(cached) as VoiceOrderSession;
    }
    return null;
  }

  /**
   * 从缓存中删除
   */
  private async removeFromCache(sessionId: string): Promise<void> {
    const key = `voice:session:${sessionId}`;
    await this.redisService.getClient().del(key);
  }
}
