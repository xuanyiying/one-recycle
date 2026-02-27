'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock, User, CheckCircle, Loader2 } from 'lucide-react';

interface WaitingSession {
  id: string;
  userId: string;
  user: {
    nickname: string;
    avatarUrl?: string;
    mobile?: string;
  };
  createdAt: string;
  queuePosition: number;
}

interface ActiveSession {
  id: string;
  userId: string;
  user: {
    nickname: string;
    avatarUrl?: string;
    mobile?: string;
  };
  topic?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  createdAt: string;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  waitingSessions: number;
  avgResponseTime: number;
  avgSatisfaction: number;
}

export default function CustomerServicePage() {
  const router = useRouter();
  const [waitingSessions, setWaitingSessions] = useState<WaitingSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    activeSessions: 0,
    waitingSessions: 0,
    avgResponseTime: 0,
    avgSatisfaction: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'waiting' | 'active'>('waiting');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [waitingRes, activeRes, statsRes] = await Promise.all([
        fetch('/api/customer/waiting-sessions'),
        fetch('/api/customer/active-sessions'),
        fetch('/api/customer/stats'),
      ]);

      if (waitingRes.ok) {
        const data = await waitingRes.json();
        setWaitingSessions(Array.isArray(data) ? data : []);
      }

      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveSessions(Array.isArray(data) ? data : []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data || {
          totalSessions: 0,
          activeSessions: 0,
          waitingSessions: 0,
          avgResponseTime: 0,
          avgSatisfaction: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSession = async (sessionId: string) => {
    setAcceptingId(sessionId);
    try {
      const res = await fetch(`/api/customer/sessions/${sessionId}/accept`, {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('已接入会话');
        router.push(`/customer/chat/${sessionId}`);
      } else {
        toast.error('接入失败');
      }
    } catch (error) {
      toast.error('接入失败');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleOpenChat = (sessionId: string) => {
    router.push(`/customer/chat/${sessionId}`);
  };

  const formatTime = (time?: string) => {
    if (!time) return '-';
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
    return date.toLocaleDateString();
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value ?? 0}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="今日会话"
          value={stats.totalSessions}
          icon={MessageSquare}
          color="text-blue-500"
        />
        <StatCard
          title="进行中"
          value={stats.activeSessions}
          icon={Clock}
          color="text-blue-600"
        />
        <StatCard
          title="等待接入"
          value={stats.waitingSessions}
          icon={User}
          color="text-yellow-500"
        />
        <StatCard
          title="平均满意度"
          value={stats.avgSatisfaction || 0}
          icon={CheckCircle}
          color="text-green-500"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab('waiting')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'waiting'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              等待接入 <Badge variant="secondary" className="ml-1">{waitingSessions.length}</Badge>
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'active'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              我的会话 <Badge variant="secondary" className="ml-1">{activeSessions.length}</Badge>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activeTab === 'waiting' ? (
            <div className="space-y-4">
              {waitingSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无等待中的会话</div>
              ) : (
                waitingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={session.user?.avatarUrl} />
                        <AvatarFallback>{session.user?.nickname?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{session.user?.nickname || '用户'}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>排队位置: 第 {session.queuePosition} 位</span>
                          <span>等待时间: {formatTime(session.createdAt)}</span>
                          {session.user?.mobile && <span>手机: {session.user.mobile}</span>}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAcceptSession(session.id)}
                      disabled={acceptingId === session.id}
                    >
                      {acceptingId === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      接入
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无进行中的会话</div>
              ) : (
                activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={session.user?.avatarUrl} />
                        <AvatarFallback>{session.user?.nickname?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{session.user?.nickname || '用户'}</p>
                          <Badge variant="default">进行中</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{session.lastMessage?.content || session.topic || '暂无消息'}</p>
                          <p className="text-xs">
                            {formatTime(session.lastMessage?.createdAt || session.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => handleOpenChat(session.id)}>
                      打开对话
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
