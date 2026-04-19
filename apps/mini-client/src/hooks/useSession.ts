import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { API_BASE_URL } from '@/utils/request';
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
      const token = Storage.getToken() || '';

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

      const response = await Taro.request({
        url: `${API_BASE_URL}/customer/sessions`,
        method: 'POST',
        data: { ...params, userId },
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.statusCode === 200 || response.statusCode === 201) {
        const newSession = response.data as ChatSession;
        setSession(newSession);
        setIsOffline(false);
        return newSession;
      } else if (response.statusCode === 404) {
        logger.warn('[CustomerSession] API endpoint not found, using offline mode');
        const mockSession = createMockSession();
        setSession(mockSession);
        setIsOffline(true);
        Taro.showToast({
          title: '使用离线模式',
          icon: 'none',
          duration: 2000,
        });
        return mockSession;
      } else {
        throw new Error(response.data?.message || '创建会话失败');
      }
    } catch (err: any) {
      logger.error('[CustomerSession] Create session error:', err);

      if (err.errMsg?.includes('request:fail') || err.message?.includes('network')) {
        logger.warn('[CustomerSession] Network error, using offline mode');
        const mockSession = createMockSession();
        setSession(mockSession);
        setIsOffline(true);
        Taro.showToast({
          title: '网络异常，使用离线模式',
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
      const token = Storage.getToken() || '';

      const response = await Taro.request({
        url: `${API_BASE_URL}/customer/sessions/${sessionId}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.statusCode === 200) {
        const sessionData = response.data as ChatSession;
        setSession(sessionData);
        return sessionData;
      } else {
        throw new Error(response.data?.message || '获取会话失败');
      }
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
      const token = Storage.getToken() || '';

      const response = await Taro.request({
        url: `${API_BASE_URL}/customer/sessions/${sessionId}/close`,
        method: 'PUT',
        header: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.statusCode === 200) {
        setSession(null);
        return true;
      } else {
        throw new Error(response.data?.message || '关闭会话失败');
      }
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
      const token = Storage.getToken() || '';

      const response = await Taro.request({
        url: `${API_BASE_URL}/customer/sessions/${sessionId}/transfer`,
        method: 'POST',
        data: { reason },
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.statusCode === 200) {
        const updatedSession = response.data as ChatSession;
        setSession(updatedSession);
        return true;
      } else {
        throw new Error(response.data?.message || '转接失败');
      }
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
      const token = Storage.getToken() || '';

      const response = await Taro.request({
        url: `${API_BASE_URL}/customer/sessions/${sessionId}/satisfaction`,
        method: 'POST',
        data: { satisfactionRating: rating, feedback },
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.statusCode === 200) {
        return true;
      } else {
        throw new Error(response.data?.message || '提交评价失败');
      }
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
