import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from '../dto';
import { AIReplyService } from '../services/ai-reply.service';
import { MessageService } from '../services/message.service';
import { SessionService } from '../services/session.service';

type AuthenticatedSocket = Socket & {
  userId: string;
  sessionId?: string;
  isAgent: boolean;
};

@WebSocketGateway({
  namespace: '/customer',
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins =
        process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || [];
      const isDev = (process.env.NODE_ENV || 'development') === 'development';
      const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isDev && localhostPattern.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  },
})
export class CustomerServiceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CustomerServiceGateway.name);
  private readonly userSockets: Map<string, Set<string>> = new Map();
  private readonly agentSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly messageService: MessageService,
    private readonly aiReplyService: AIReplyService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token as string, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'dev-only-secret-key',
      });

      client.userId = payload.sub || payload.userId;
      client.isAgent = payload.role === 'agent' || payload.role === 'staff';

      if (client.isAgent) {
        this.addAgentSocket(client.userId, client.id);
        await this.broadcastAgentStatus(client.userId, 'online');
      } else {
        this.addUserSocket(client.userId, client.id);
      }

      this.logger.log(
        `Client connected: ${client.id}, userId: ${client.userId}, isAgent: ${client.isAgent}`,
      );

      client.emit('connected', {
        userId: client.userId,
        isAgent: client.isAgent,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Authentication failed: ${err.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    if (client.userId) {
      if (client.isAgent) {
        this.removeAgentSocket(client.userId, client.id);
        await this.broadcastAgentStatus(client.userId, 'offline');
      } else {
        this.removeUserSocket(client.userId, client.id);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ): Promise<void> {
    try {
      const session = await this.sessionService.findOne(data.sessionId);
      if (!session) {
        throw new WsException('Session not found');
      }

      if (session.userId.toString() !== client.userId && !client.isAgent) {
        throw new WsException('Access denied');
      }

      client.sessionId = data.sessionId;
      client.join(`session:${data.sessionId}`);

      const unreadCount = await this.messageService.markSessionAsRead(
        data.sessionId,
        client.userId,
      );

      client.emit('session_joined', {
        sessionId: data.sessionId,
        unreadCount,
      });

      this.logger.log(`Client ${client.id} joined session ${data.sessionId}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Join session failed: ${err.message}`);
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('leave_session')
  handleLeaveSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ): void {
    client.leave(`session:${data.sessionId}`);
    client.sessionId = undefined;
    client.emit('session_left', { sessionId: data.sessionId });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ): Promise<void> {
    try {
      const message = await this.messageService.send(
        data,
        client.userId,
        client.isAgent,
      );

      this.server.to(`session:${data.sessionId}`).emit('message', {
        id: message.id.toString(),
        sessionId: message.sessionId.toString(),
        senderType: message.senderType,
        senderId: message.senderId?.toString(),
        messageType: message.messageType,
        content: message.content,
        mediaUrl: message.mediaUrl,
        extraData: message.extraData,
        createdAt: message.createdAt,
      });

      if (!client.isAgent && message.senderType === 'USER') {
        const session = await this.sessionService.findOne(data.sessionId);
        if (session && session.type === 'AUTO') {
          this.processAIReply(
            data.sessionId,
            client.userId,
            data.content || '',
          );
        }
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Send message failed: ${err.message}`);
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; isTyping: boolean },
  ): void {
    client.to(`session:${data.sessionId}`).emit('typing', {
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ): Promise<void> {
    const count = await this.messageService.markSessionAsRead(
      data.sessionId,
      client.userId,
    );

    client.to(`session:${data.sessionId}`).emit('messages_read', {
      by: client.userId,
      count,
    });
  }

  @SubscribeMessage('transfer_agent')
  async handleTransferAgent(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string; reason?: string },
  ): Promise<void> {
    try {
      await this.sessionService.transferToAgent(data.sessionId, {
        reason: data.reason,
      });

      const queuePosition = await this.sessionService.getQueuePosition(
        data.sessionId,
      );

      client.emit('transfer_initiated', {
        sessionId: data.sessionId,
        queuePosition,
      });

      await this.messageService.sendSystemMessage(
        data.sessionId,
        '正在为您转接人工客服，请稍候...',
        { queuePosition },
      );

      this.notifyAgentsNewWaiting(data.sessionId);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Transfer to agent failed: ${err.message}`);
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('agent_accept_session')
  async handleAgentAcceptSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { sessionId: string },
  ): Promise<void> {
    if (!client.isAgent) {
      client.emit('error', { message: 'Only agents can accept sessions' });
      return;
    }

    try {
      await this.sessionService.assignAgent(data.sessionId, client.userId);

      await this.messageService.sendSystemMessage(
        data.sessionId,
        '客服已接入，请问有什么可以帮助您的？',
        { agentId: client.userId },
      );

      this.server.to(`session:${data.sessionId}`).emit('agent_joined', {
        agentId: client.userId,
        sessionId: data.sessionId,
      });

      client.emit('session_accepted', { sessionId: data.sessionId });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Agent accept session failed: ${err.message}`);
      client.emit('error', { message: err.message });
    }
  }

  private async processAIReply(
    sessionId: string,
    userId: string,
    message: string,
  ): Promise<void> {
    try {
      const response = await this.aiReplyService.processMessage(
        sessionId,
        userId,
        message,
      );

      const aiMessage = await this.messageService.sendAIMessage(
        sessionId,
        response.content,
        response.extraData,
      );

      this.server.to(`session:${sessionId}`).emit('message', {
        id: aiMessage.id.toString(),
        sessionId: aiMessage.sessionId.toString(),
        senderType: 'AI',
        messageType: aiMessage.messageType,
        content: aiMessage.content,
        extraData: aiMessage.extraData,
        createdAt: aiMessage.createdAt,
        suggestedActions: response.suggestedActions,
      });

      if (response.needTransfer) {
        await this.handleTransferAgent(
          { userId, sessionId, isAgent: false } as any,
          { sessionId, reason: 'AI无法解决' },
        );
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`AI reply failed: ${err.message}`);
    }
  }

  private notifyAgentsNewWaiting(sessionId: string): void {
    this.server.emit('new_waiting_session', { sessionId });
  }

  private broadcastAgentStatus(agentId: string, status: string): void {
    this.server.emit('agent_status', { agentId, status });
  }

  private addUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  private removeUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  private addAgentSocket(agentId: string, socketId: string): void {
    if (!this.agentSockets.has(agentId)) {
      this.agentSockets.set(agentId, new Set());
    }
    this.agentSockets.get(agentId)!.add(socketId);
  }

  private removeAgentSocket(agentId: string, socketId: string): void {
    const sockets = this.agentSockets.get(agentId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.agentSockets.delete(agentId);
      }
    }
  }

  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  getOnlineAgentsCount(): number {
    return this.agentSockets.size;
  }
}
