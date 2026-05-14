import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  sessionId: string;
  senderType: 'USER' | 'AGENT' | 'SYSTEM' | 'AI';
  senderId?: string;
  messageType: 'TEXT' | 'IMAGE' | 'ORDER_CARD' | 'TICKET_CARD';
  content?: string;
  mediaUrl?: string;
  extraData?: any;
  createdAt: string;
}

export interface SocketError {
  message: string;
}

export type MessageHandler = (data: Message) => void;
export type ErrorHandler = (error: SocketError) => void;
export type VoidHandler = () => void;

/**
 * 客服 WebSocket 服务
 * 封装 socket.io 连接管理，用于客服聊天功能
 */
class CustomerSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private connectHandlers: Set<VoidHandler> = new Set();
  private disconnectHandlers: Set<VoidHandler> = new Set();
  private agentJoinedHandlers: Set<VoidHandler> = new Set();

  /**
   * 连接到 WebSocket 服务器
   * @param token 认证 token
   * @returns Promise 连接成功或失败
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || '';

      this.socket = io(`${wsUrl}/customer`, {
        auth: { token },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        this.connectHandlers.forEach((handler) => handler());
        resolve();
      });

      this.socket.on('disconnect', () => {
        this.disconnectHandlers.forEach((handler) => handler());
      });

      this.socket.on('message', (data: Message) => {
        this.messageHandlers.forEach((handler) => handler(data));
      });

      this.socket.on('agent_joined', () => {
        this.agentJoinedHandlers.forEach((handler) => handler());
      });

      this.socket.on('error', (error: SocketError) => {
        this.errorHandlers.forEach((handler) => handler(error));
      });

      this.socket.on('connect_error', (error: Error) => {
        reject(error);
      });
    });
  }

  /**
   * 重新连接（用于 token 刷新后）
   * @param token 新的认证 token
   */
  reconnect(token: string): Promise<void> {
    if (this.socket) {
      this.socket.auth = { token };
      this.socket.disconnect().connect();
      return new Promise((resolve, reject) => {
        const onConnect = () => {
          this.socket?.off('connect_error', onError);
          resolve();
        };
        const onError = (error: Error) => {
          this.socket?.off('connect', onConnect);
          reject(error);
        };
        this.socket?.once('connect', onConnect);
        this.socket?.once('connect_error', onError);
      });
    }
    return this.connect(token);
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * 加入会话
   * @param sessionId 会话 ID
   */
  joinSession(sessionId: string): void {
    this.socket?.emit('join_session', { sessionId });
  }

  /**
   * 离开会话
   * @param sessionId 会话 ID
   */
  leaveSession(sessionId: string): void {
    this.socket?.emit('leave_session', { sessionId });
  }

  /**
   * 发送消息
   * @param data 消息数据
   */
  sendMessage(data: {
    sessionId: string;
    messageType: string;
    content?: string;
    mediaUrl?: string;
  }): void {
    this.socket?.emit('send_message', data);
  }

  /**
   * 发送正在输入状态
   * @param sessionId 会话 ID
   * @param isTyping 是否正在输入
   */
  sendTyping(sessionId: string, isTyping: boolean): void {
    this.socket?.emit('typing', { sessionId, isTyping });
  }

  /**
   * 标记消息已读
   * @param sessionId 会话 ID
   */
  markAsRead(sessionId: string): void {
    this.socket?.emit('mark_read', { sessionId });
  }

  /**
   * 转接人工客服
   * @param sessionId 会话 ID
   * @param reason 转接原因
   */
  transferToAgent(sessionId: string, reason?: string): void {
    this.socket?.emit('transfer_agent', { sessionId, reason });
  }

  /**
   * 客服接受会话
   * @param sessionId 会话 ID
   */
  acceptSession(sessionId: string): void {
    this.socket?.emit('agent_accept_session', { sessionId });
  }

  /**
   * 注册消息接收处理器
   * @param handler 消息处理函数
   * @returns 取消注册的函数
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * 注册错误处理器
   * @param handler 错误处理函数
   * @returns 取消注册的函数
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * 注册连接成功处理器
   * @param handler 连接成功处理函数
   * @returns 取消注册的函数
   */
  onConnect(handler: VoidHandler): () => void {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  /**
   * 注册断开连接处理器
   * @param handler 断开连接处理函数
   * @returns 取消注册的函数
   */
  onDisconnect(handler: VoidHandler): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  /**
   * 注册客服接入处理器
   * @param handler 客服接入处理函数
   * @returns 取消注册的函数
   */
  onAgentJoined(handler: VoidHandler): () => void {
    this.agentJoinedHandlers.add(handler);
    return () => this.agentJoinedHandlers.delete(handler);
  }

  /**
   * 检查是否已连接
   */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * 获取 socket ID
   */
  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

// 导出单例实例
export const customerSocketService = new CustomerSocketService();
export default customerSocketService;
