'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const publicPaths = ['/login', '/403', '/404'];

      if (!token && !publicPaths.includes(pathname)) {
        router.push('/login');
        setAuthorized(false);
      } else if (token && pathname === '/login') {
        router.push('/dashboard');
        setAuthorized(true);
      } else {
        setAuthorized(true);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (!authorized) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
