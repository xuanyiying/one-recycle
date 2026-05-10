'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthContext';
import { readStoredAuthSession } from '@/lib/authSession';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/toast';

const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const session = readStoredAuthSession();
      await authService.logout({
        refreshToken: session?.refreshToken || undefined,
        allDevices: true,
      });
      logout();
      toast.success('已退出登录');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      logout();
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-sm px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-syntax-comment">~/admin/</span>
        <span className="font-mono text-sm text-foreground">dashboard</span>
        <span className="font-mono text-sm text-syntax-keyword animate-cursor">|</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="通知"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary" />
        </Button>

        <DropdownMenu
          trigger={
            <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/50 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src="" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="font-mono text-sm text-foreground">admin</span>
            </div>
          }
        >
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            个人资料
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            设置
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {loggingOut ? '退出中...' : '退出登录'}
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
