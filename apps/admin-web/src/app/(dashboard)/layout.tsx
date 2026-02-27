'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden bg-background">
          <aside className="hidden md:flex">
            <Sidebar />
          </aside>

          {isSidebarOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={() => setIsSidebarOpen(false)}
              />
              <div className="relative z-50 flex h-full w-64 flex-col shadow-terminal animate-in slide-in-from-left">
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
              </div>
            </div>
          )}

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center border-b border-border/40 px-4 md:hidden h-14 bg-card">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="ml-3 flex items-center gap-2">
                <span className="font-mono text-sm font-medium">one-recycle</span>
                <span className="font-mono text-xs text-syntax-comment">admin</span>
              </div>
            </div>

            <div className="hidden md:block">
              <Header />
            </div>

            <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </ErrorBoundary>
    </AuthGuard>
  );
}
