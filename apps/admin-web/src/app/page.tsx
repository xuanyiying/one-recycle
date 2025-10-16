'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>欢迎来到后台管理系统</h1>
    </div>
  );
};

export default HomePage;