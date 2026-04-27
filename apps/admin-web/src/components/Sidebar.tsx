'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  href: string;
  icon: LucideIcon;
  label: string;
  children?: Array<{ href: string; label: string }>;
}
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tags,
  Database,
  Truck,
  Bell,
  Settings,
  Wallet,
  X,
  Gift,
  FileText,
  Warehouse
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, onClose }) => {
  const pathname = usePathname();

  const menuGroups: Array<{
    title: string;
    items: MenuItem[];
  }> = [
      {
        title: '业务管理',
        items: [
          { href: '/dashboard', icon: LayoutDashboard, label: '仪表板' },
          { href: '/orders', icon: ShoppingBag, label: '订单管理' },
          { href: '/inventory', icon: Database, label: '进存销管理' },
        ],
      },
      {
        title: '积分商城',
        items: [
          {
            href: '/points',
            icon: Gift,
            label: '积分商城',
            children: [
              { href: '/points/overview', label: '概览' },
              { href: '/points/products', label: '商品管理' },
              { href: '/points/orders', label: '订单管理' },
              { href: '/points/tasks', label: '任务管理' },
            ]
          },
        ],
      },
      {
        title: '财务中心',
        items: [
          { href: '/finance/recharge', icon: Wallet, label: '财务充值' },
          { href: '/finance/expense', icon: Database, label: '支出管理' },
        ],
      },
      {
        title: '运营中心',
        items: [
          { href: '/users', icon: Users, label: '用户管理' },
          { href: '/categories', icon: Tags, label: '分类管理' },
          {
            href: '/content',
            icon: FileText,
            label: '内容配置',
            children: [
              { href: '/content/faq', label: '常见问答' },
              { href: '/content/recycle-rules', label: '回收规则' },
            ]
          },
        ],
      },
      {
        title: '系统设置',
        items: [
          { href: '/notifications', icon: Bell, label: '通知管理' },
          { href: '/settings/logistics', icon: Truck, label: '快递接入' },
          { href: '/settings/category-warehouse', icon: Warehouse, label: '分类仓库' },
          { href: '/settings', icon: Settings, label: '系统设置' },
        ],
      },
    ];

  return (
    <div className={cn("flex h-screen w-64 flex-col border-r border-border/40 bg-card text-card-foreground", className)}>
      {/* Terminal-style header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="font-mono text-sm font-medium text-foreground">one-recycle</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {menuGroups.map((group, index) => (
          <div key={index} className="mb-6 px-3">
            <h3 className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-syntax-comment">
              {'// '}{group.title}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group flex items-center rounded-md px-3 py-2 font-mono text-sm transition-all duration-150',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      {isActive && (
                        <span className="mr-2 text-primary animate-cursor">{'>'}</span>
                      )}
                      <item.icon
                        className={cn(
                          'h-4 w-4 flex-shrink-0 transition-colors',
                          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                          !isActive && 'mr-3'
                        )}
                      />
                      <span className={cn(!isActive && 'ml-0')}>{item.label}</span>
                    </Link>
                    {hasChildren && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children?.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
                              className={cn(
                                'block rounded-md px-3 py-2 font-mono text-xs transition-all duration-150',
                                isChildActive
                                  ? 'text-primary'
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                            >
                              {isChildActive && <span className="mr-1">{'>'} </span>}
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Terminal status bar */}
      <div className="border-t border-border/40 px-4 py-2">
        <p className="font-mono text-[10px] text-syntax-comment">
          v1.0.0 <span className="text-syntax-string">ready</span>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
