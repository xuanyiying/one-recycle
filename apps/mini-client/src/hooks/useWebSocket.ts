import { logger } from '@/utils/logger';
import { Storage } from '@/utils/storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const env: Partial<NodeJS.ProcessEnv> = typeof process !== 'undefined' ? process.env : {};
const WS_URL = env.TARO_APP_WS_URL || 'wss://backbuy.cn';

type WSEventHandler = (data: any) => void;

interface WSMessage {
  event: string;
  data: any;
}

const MAX_QUEUE_SIZE = 50

class WebSocketManager {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private eventHandlers: Map<string, Set<WSEventHandler>> = new Map();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private messageQueue: any[] = [];
  private heartbeatTimer: any = null;
  private token: string = '';

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.token = token;

      try {
        this.socket = io(WS_URL, {
          path: '/customer',
          auth: { token },
          transports: ['websocket'],
          reconnection: false,
          timeout: 10000,
        });

        this.socket.on('connect', () => {
          logger.log('Socket.IO connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.notifyConnectionListeners();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          logger.error('Socket.IO connection error:', error);
          this.connected = false;
          this.notifyConnectionListeners();
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          logger.log('Socket.IO disconnected:', reason);
          this.connected = false;
          this.stopHeartbeat();
          this.notifyConnectionListeners();
          this.attemptReconnect();
        });

        this.socket.on('error', (error) => {
          logger.error('Socket.IO error:', error);
        });

        this.socket.onAny((event: string, data: any) => {
          logger.log('Socket.IO message received:', event, data);
          this.handleMessage({ event, data });
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.stopHeartbeat();
      this.eventHandlers.clear()
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.notifyConnectionListeners();
      logger.log('Socket.IO disconnected manually');
    }
  }

  on(event: string, handler: WSEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: WSEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.add(listener);
    listener(this.connected);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private notifyConnectionListeners(): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(this.connected);
      } catch (error) {
        logger.error('Error in connection listener:', error);
      }
    });
  }

  emit(event: string, data: any): void {
    if (this.connected && this.socket) {
      this.socket.emit(event, data);
      logger.log('Socket.IO message sent:', event, data);
    } else {
      logger.log('Socket.IO not connected, queuing message:', event);
      if (this.messageQueue.length >= MAX_QUEUE_SIZE) {
        this.messageQueue.shift()
        logger.warn('Message queue overflow, dropping oldest message');
      }
      this.messageQueue.push({ event, data });
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private handleMessage(message: WSMessage): void {
    const handlers = this.eventHandlers.get(message.event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.data);
        } catch (error) {
          logger.error(`Error in handler for event ${message.event}:`, error);
        }
      });
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        if (this.token) {
          this.connect(this.token).catch((error) => {
            logger.error('Reconnect failed:', error);
          });
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.connected && this.socket) {
        this.socket.emit('ping', { timestamp: Date.now() });
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.connected) {
      const { event, data } = this.messageQueue.shift()!;
      this.emit(event, data);
    }
  }
}

const wsManager = new WebSocketManager();

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const registeredHandlersRef = useRef<Map<string, WSEventHandler>>(new Map());

  useEffect(() => {
    unsubscribeRef.current = wsManager.onConnectionChange((isConnected) => {
      setConnected(isConnected);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      registeredHandlersRef.current.forEach((handler, event) => {
        wsManager.off(event, handler);
      });
      registeredHandlersRef.current.clear();
    };
  }, []);

  const connect = useCallback(async () => {
    const token = Storage.getToken();
    if (token) {
      try {
        await wsManager.connect(token);
        setConnected(true);
      } catch (error) {
        setConnected(false);
        logger.error('WebSocket connection error:', error);
        throw error;
      }
    } else {
      throw new Error('No token found');
    }
  }, []);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
    setConnected(false);
  }, []);

  const on = useCallback((event: string, handler: WSEventHandler) => {
    wsManager.on(event, handler);
    registeredHandlersRef.current.set(event, handler);
  }, []);

  const off = useCallback((event: string, handler: WSEventHandler) => {
    wsManager.off(event, handler);
    registeredHandlersRef.current.delete(event);
  }, []);

  const emit = useCallback((event: string, data: any) => {
    wsManager.emit(event, data);
  }, []);

  return {
    connected,
    connect,
    disconnect,
    on,
    off,
    emit,
  };
}

export type { WSMessage };
