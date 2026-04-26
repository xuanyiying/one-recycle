'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PointsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/points/overview');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground font-mono">重定向中...</p>
      </div>
    </div>
  );
}
