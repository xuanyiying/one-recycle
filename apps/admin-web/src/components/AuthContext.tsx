'use client';

import { toast } from '@/components/ui/toast';
import { clearAuthSession, readStoredAuthSession, writeAuthSession } from '@/lib/authSession';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface User {
  id: string;
  username?: string;
  account?: string;
  nickname?: string;
  name?: string;
  avatar?: string;
  role?: string;
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  const checkAuth = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const session = readStoredAuthSession();

      if (session?.token && session.user && typeof session.user.id === 'string') {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: session.user as User,
          token: session.token,
        });
        return true;
      }

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      });
      return false;
    } catch (error) {
      console.error('LocalStorage access failed:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
      });
      return false;
    }
  }, []);

  const login = useCallback((token: string, user: User, refreshToken?: string) => {
    try {
      writeAuthSession({
        token,
        refreshToken,
        user,
      });
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token,
      });
    } catch (error) {
      console.error('Failed to save auth data:', error);
      toast.error('登录信息保存失败，请重试');
    }
  }, []);

  const logout = useCallback(() => {
    try {
      clearAuthSession();
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
    });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleUnauthorized = () => {
      console.error('[AuthContext] auth:unauthorized event received - logging out and redirecting to /login');
      if (process.env.NODE_ENV === 'development') {
        console.warn('[AuthContext] auth:unauthorized');
      }
      logout();
      window.location.href = '/login';
    };

    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<{ token: string, user: User }>;
      console.log('[AuthContext] auth:refreshed event received, updating context state');
      setAuthState(prev => ({
        ...prev,
        token: customEvent.detail.token,
        user: customEvent.detail.user || prev.user
      }));
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:refreshed', handleTokenRefreshed);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:refreshed', handleTokenRefreshed);
    };
  }, [logout]);

  const value = useMemo(() => ({
    ...authState,
    login,
    logout,
    checkAuth,
  }), [authState, login, logout, checkAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
