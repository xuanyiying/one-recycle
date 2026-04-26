'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const publicPaths = ['/login', '/403', '/404'];

        if (!token && !publicPaths.includes(pathname)) {
          // 清除任何可能的认证信息
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
          localStorage.removeItem('login_mode');
          localStorage.removeItem('tenant_code');
          document.cookie = 'auth_token=; path=/; max-age=0';
          
          router.push('/login');
          setAuthorized(false);
        } else if (token && pathname === '/login') {
          router.push('/dashboard');
          setAuthorized(true);
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // 出错时也重定向到登录页
        router.push('/login');
        setAuthorized(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground font-mono">验证中...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
