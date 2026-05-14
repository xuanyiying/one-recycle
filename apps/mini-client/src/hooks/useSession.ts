import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { get, post, put } from '@/utils/request';
import { Storage } from '@/utils/storage';
import { logger } from '@/utils/logger';

interface ChatSession {
  id: string;
  userId: string;
  agentId?: string;
  type: 'AUTO' | 'MANUAL';
  status: 'ACTIVE' | 'WAITING' | 'CLOSED';
  topic?: string;
  context?: any;
  satisfactionRating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

interface CreateSessionParams {
  userId?: string;
  type?: 'AUTO' | 'MANUAL';
  topic?: string;
  context?: any;
}

const createMockSession = (): ChatSession => {
  return {
    id: `session_${Date.now()}`,
    userId: 'mock_user',
    type: 'AUTO',
    status: 'ACTIVE',
    topic: '智能客服咨询',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export function useSession() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const createSession = useCallback(async (params?: CreateSessionParams): Promise<ChatSession | null> => {
    setLoading(true);
    setError(null);

    try {
      const userId = params?.userId || Storage.getUserId();

      if (!userId) {
        logger.warn('[CustomerSession] No userId found, user:', Storage.getUser());
        const mockSession = createMockSession();
        setSession(mockSession);
        setIsOffline(true);
        Taro.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000,
        });
        return mockSession;
      }

      const newSession = await post<ChatSession>('/customer/sessions', { ...params, userId });
      setSession(newSession);
      setIsOffline(false);
      return newSession;
    } catch (err: any) {
      logger.error('[CustomerSession] Create session error:', err);

      if (err.statusCode === 404 || err.errMsg?.includes('request:fail') || err.message?.includes('network')) {
        logger.warn('[CustomerSession] API unavailable, using offline mode');
        const mockSession = createMockSession();
        setSession(mockSession);
        setIsOffline(true);
        Taro.showToast({
          title: err.statusCode === 404 ? '使用离线模式' : '网络异常，使用离线模式',
          icon: 'none',
          duration: 2000,
        });
        return mockSession;
      }

      const errorMsg = err.message || '创建会话失败';
      setError(errorMsg);
      Taro.showToast({ title: errorMsg, icon: 'none' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSession = useCallback(async (sessionId: string): Promise<ChatSession | null> => {
    if (isOffline) {
      return session;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionData = await get<ChatSession>(`/customer/sessions/${sessionId}`);
      setSession(sessionData);
      return sessionData;
    } catch (err: any) {
      const errorMsg = err.message || '获取会话失败';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isOffline, session]);

  const closeSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (isOffline) {
      setSession(null);
      return true;
    }

    setLoading(true);
    setError(null);

    try {
      await put(`/customer/sessions/${sessionId}/close`);
      setSession(null);
      return true;
    } catch (err: any) {
      const errorMsg = err.message || '关闭会话失败';
      setError(errorMsg);
      Taro.showToast({ title: errorMsg, icon: 'none' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  const transferToAgent = useCallback(async (sessionId: string, reason?: string): Promise<boolean> => {
    if (isOffline) {
      Taro.showToast({
        title: '离线模式无法转接人工',
        icon: 'none',
      });
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedSession = await post<ChatSession>(`/customer/sessions/${sessionId}/transfer`, { reason });
      setSession(updatedSession);
      return true;
    } catch (err: any) {
      const errorMsg = err.message || '转接失败';
      setError(errorMsg);
      Taro.showToast({ title: errorMsg, icon: 'none' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  const submitSatisfaction = useCallback(async (
    sessionId: string,
    rating: number,
    feedback?: string
  ): Promise<boolean> => {
    if (isOffline) {
      Taro.showToast({
        title: '感谢您的评价',
        icon: 'success',
      });
      return true;
    }

    setLoading(true);
    setError(null);

    try {
      await post(`/customer/sessions/${sessionId}/satisfaction`, { satisfactionRating: rating, feedback });
      return true;
    } catch (err: any) {
      const errorMsg = err.message || '提交评价失败';
      setError(errorMsg);
      Taro.showToast({ title: errorMsg, icon: 'none' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  return {
    session,
    loading,
    error,
    isOffline,
    createSession,
    getSession,
    closeSession,
    transferToAgent,
    submitSatisfaction,
  };
}
