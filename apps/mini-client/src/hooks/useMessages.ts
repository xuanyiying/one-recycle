import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { API_BASE_URL } from '@/utils/request';
import { Storage } from '@/utils/storage';
import { logger } from '@/utils/logger';

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderType: 'USER' | 'AGENT' | 'SYSTEM' | 'AI';
  senderId?: string;
  messageType: 'TEXT' | 'IMAGE' | 'VOICE' | 'ORDER_CARD' | 'TICKET_CARD' | 'QUICK_ACTION';
  content?: string;
  mediaUrl?: string;
  extraData?: any;
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  isRead: boolean;
  createdAt: string;
}

interface SendMessageParams {
  sessionId: string;
  messageType: 'TEXT' | 'IMAGE' | 'VOICE';
  content?: string;
  mediaUrl?: string;
  extraData?: any;
}

const AI_RESPONSES = [
  '您好，我是智能客服助手，很高兴为您服务！请问有什么可以帮助您的吗？',
  '我理解您的问题。让我为您查询一下相关信息...',
  '根据您的描述，建议您可以尝试以下解决方案...',
  '如果您还有其他问题，欢迎随时咨询。',
  '感谢您的耐心等待，我已经为您处理好了。',
  '请问还有什么其他需要帮助的吗？',
];

const getRandomAIResponse = (): string => {
  const randomIndex = Math.floor(Math.random() * AI_RESPONSES.length);
  return AI_RESPONSES[randomIndex] || '正在为您处理...';
};

export function useMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const loadMessages = useCallback(async (sessionId: string, before?: string): Promise<void> => {
    if (isOffline) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = Storage.getToken() || '';
      const params = new URLSearchParams();
      if (before) params.append('before', before);
      params.append('limit', '20');

      const response = await Taro.request({
        url: `${API_BASE_URL}/customer/sessions/${sessionId}/messages?${params.toString()}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.statusCode === 200) {
        const { messages: newMessages, hasMore: more } = response.data;

        if (before) {
          setMessages((prev) => [...newMessages, ...prev]);
        } else {
          setMessages(newMessages);
        }
        setHasMore(more);
        setIsOffline(false);
      } else if (response.statusCode === 404) {
        logger.warn('[CustomerMessages] API endpoint not found, using offline mode');
        setIsOffline(true);
      }
    } catch (err: any) {
      logger.error('[CustomerMessages] Load messages error:', err);

      if (err.errMsg?.includes('request:fail') || err.message?.includes('network')) {
        logger.warn('[CustomerMessages] Network error, using offline mode');
        setIsOffline(true);
      } else {
        const errorMsg = err.message || '加载消息失败';
        setError(errorMsg);
        Taro.showToast({ title: errorMsg, icon: 'none' });
      }
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  const sendMessage = useCallback(async (params: SendMessageParams): Promise<ChatMessage> => {
    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      id: tempId,
      sessionId: params.sessionId,
      senderType: 'USER',
      messageType: params.messageType,
      content: params.content,
      mediaUrl: params.mediaUrl,
      extraData: params.extraData,
      status: 'SENDING',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    if (isOffline) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? { ...msg, status: 'SENT' } : msg))
        );

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sessionId: params.sessionId,
          senderType: 'AI',
          messageType: 'TEXT',
          content: getRandomAIResponse(),
          status: 'SENT',
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 500);

      return { ...tempMessage, status: 'SENT' };
    }

    try {
      const token = Storage.getToken() || '';
      const response = await Taro.request({
        url: `${API_BASE_URL}/customer/messages`,
        method: 'POST',
        data: params,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.statusCode === 200 || response.statusCode === 201) {
        const sentMessage = response.data as ChatMessage;

        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? sentMessage : msg))
        );

        return sentMessage;
      } else {
        throw new Error(response.data?.message || '发送失败');
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'FAILED' } : msg
        )
      );
      throw err;
    }
  }, [isOffline]);

  const markAsRead = useCallback(async (messageIds: string[]): Promise<void> => {
    if (isOffline || messageIds.length === 0) return;

    try {
      const token = Storage.getToken() || '';
      await Taro.request({
        url: `${API_BASE_URL}/customer/messages/read`,
        method: 'PUT',
        data: { messageIds },
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, isRead: true, status: 'READ' } : msg
        )
      );
    } catch (err) {
      logger.error('Mark as read failed:', err);
    }
  }, [isOffline]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const retryMessage = useCallback(async (messageId: string): Promise<ChatMessage | null> => {
    const failedMessage = messages.find((msg) => msg.id === messageId);
    if (!failedMessage || failedMessage.status !== 'FAILED') {
      return null;
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status: 'SENDING' } : msg
      )
    );

    if (isOffline) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status: 'SENT' } : msg))
      );
      return { ...failedMessage, status: 'SENT' };
    }

    try {
      const token = Storage.getToken() || '';
      const response = await Taro.request({
        url: `${API_BASE_URL}/customer/messages`,
        method: 'POST',
        data: {
          sessionId: failedMessage.sessionId,
          messageType: failedMessage.messageType,
          content: failedMessage.content,
          mediaUrl: failedMessage.mediaUrl,
          extraData: failedMessage.extraData,
        },
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.statusCode === 200 || response.statusCode === 201) {
        const sentMessage = response.data as ChatMessage;

        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? sentMessage : msg))
        );

        return sentMessage;
      } else {
        throw new Error(response.data?.message || '重试发送失败');
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'FAILED' } : msg
        )
      );
      Taro.showToast({ title: err.message || '重试失败', icon: 'none' });
      return null;
    }
  }, [messages, isOffline]);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  return {
    messages,
    loading,
    hasMore,
    error,
    isOffline,
    loadMessages,
    sendMessage,
    markAsRead,
    addMessage,
    clearMessages,
    retryMessage,
    removeMessage,
  };
}
