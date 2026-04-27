'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface User {
  id: string;
  account?: string;
  username?: string;
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
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/login', '/403', '/404'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  const checkAuth = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user_info');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
            token,
          });
          return true;
        } catch {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
          });
          return false;
        }
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
      return false;
    }
  }, []);

  const login = useCallback((token: string, user: User) => {
    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_info', JSON.stringify(user));
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token,
      });
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }, []);

  const clearAuthCookies = () => {
    const cookies = ['auth_token', 'refresh_token'];
    cookies.forEach((cookieName) => {
      document.cookie = `${cookieName}=; path=/; max-age=0; SameSite=Lax`;
    });
  };

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('login_mode');
      localStorage.removeItem('tenant_code');
      clearAuthCookies();
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
      logout();
      router.push('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout, router]);

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
      if (!isPublicPath && pathname !== '/') {
        router.push('/login');
      }
    } else if (!authState.isLoading && authState.isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [authState.isLoading, authState.isAuthenticated, pathname, router]);

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

export { PUBLIC_PATHS };
