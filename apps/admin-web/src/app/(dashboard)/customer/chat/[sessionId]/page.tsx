'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { customerService } from '@/services/customerService';
import { customerSocketService, Message } from '@/services/customerSocketService';
import { Bot, History, Image, Loader2, Send, User, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';

interface Session {
  id: string;
  user: {
    id: string;
    nickname: string;
    avatarUrl?: string;
    mobile?: string;
  };
  type: 'AUTO' | 'MANUAL';
  status: 'ACTIVE' | 'WAITING' | 'CLOSED';
  topic?: string;
  createdAt: string;
}

interface QuickReply {
  id: string;
  title: string;
  content: string;
  category?: string;
}

export default function ChatPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = React.use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSession = useCallback(async () => {
    try {
      const data = await customerService.getSession(sessionId);
      setSession(data);
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  }, [sessionId]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerService.getSessionMessages(sessionId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('获取消息失败');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const fetchQuickReplies = useCallback(async () => {
    try {
      const data = await customerService.getQuickReplies();
      setQuickReplies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch quick replies:', error);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchSession();
    fetchMessages();
    fetchQuickReplies();

    let unregisterMessage: (() => void) | undefined;
    let unregisterAgentJoined: (() => void) | undefined;
    let unregisterError: (() => void) | undefined;

    const setupWebSocket = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
          toast.error('未登录或登录已过期');
          return;
        }

        await customerSocketService.connect(token);
        customerSocketService.joinSession(sessionId);

        unregisterMessage = customerSocketService.onMessage((data: Message) => {
          setMessages((prev) => [...prev, data]);
        });

        unregisterAgentJoined = customerSocketService.onAgentJoined(() => {
          toast.success('客服已接入');
        });

        unregisterError = customerSocketService.onError((error: { message?: string }) => {
          console.error('Socket error:', error);
          toast.error(error.message || '连接错误');
        });
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        toast.error('连接失败，请刷新页面重试');
      }
    };

    const handleTokenRefreshed = async (event: Event) => {
      const customEvent = event as CustomEvent<{ token: string }>;
      try {
        await customerSocketService.reconnect(customEvent.detail.token);
        customerSocketService.joinSession(sessionId);
      } catch (err) {
        console.error('WebSocket reconnect failed:', err);
      }
    };

    setupWebSocket().catch((error) => {
      console.error('WebSocket setup failed:', error);
    });

    window.addEventListener('auth:refreshed', handleTokenRefreshed);

    return () => {
      window.removeEventListener('auth:refreshed', handleTokenRefreshed);
      if (unregisterMessage) unregisterMessage();
      if (unregisterAgentJoined) unregisterAgentJoined();
      if (unregisterError) unregisterError();
      customerSocketService.leaveSession(sessionId);
      customerSocketService.disconnect();
    };
  }, [sessionId, fetchSession, fetchMessages, fetchQuickReplies]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (content: string, messageType: 'TEXT' | 'IMAGE' = 'TEXT', mediaUrl?: string) => {
    if (!content.trim() && !mediaUrl) return;

    setSending(true);
    try {
      // 使用 WebSocket 发送消息
      customerSocketService.sendMessage({
        sessionId,
        messageType,
        content,
        mediaUrl,
      });
      setInputValue('');
    } catch (error) {
      toast.error('发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    sendMessage(inputValue);
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.content);
    setShowQuickReplies(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await customerService.uploadFile(file);
      sendMessage('', 'IMAGE', data.url);
    } catch (error) {
      toast.error('上传失败');
    }
  };

  const handleCloseSession = async () => {
    try {
      await customerService.closeSession(sessionId);
      toast.success('会话已结束');
      window.history.back();
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const getMessageClass = (senderType: string) => {
    switch (senderType) {
      case 'USER':
        return 'bg-blue-500 text-white ml-auto';
      case 'AGENT':
        return 'bg-gray-100 text-gray-900';
      case 'AI':
        return 'bg-purple-100 text-purple-900';
      case 'SYSTEM':
        return 'bg-yellow-100 text-yellow-900 text-center mx-auto';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={session?.user?.avatarUrl} />
              <AvatarFallback>{session?.user?.nickname?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{session?.user?.nickname || '用户'}</div>
              <div className="text-sm text-muted-foreground">{session?.user?.mobile}</div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-1" />
              历史记录
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setCloseModalVisible(true)}>
              结束会话
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 overflow-hidden mb-4">
        <CardContent className="h-full overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-3/4" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              暂无消息
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.senderType !== 'USER' && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {msg.senderType === 'AI' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="max-w-[70%]">
                    {msg.messageType === 'IMAGE' ? (
                      <NextImage
                        src={msg.mediaUrl || ''}
                        alt="图片"
                        width={200}
                        height={200}
                        className="max-w-full rounded-lg cursor-pointer"
                        onClick={() => window.open(msg.mediaUrl, '_blank')}
                      />
                    ) : (
                      <div className={`px-4 py-2 rounded-lg ${getMessageClass(msg.senderType)}`}>
                        {msg.content}
                      </div>
                    )}
                    <div className={`text-xs text-muted-foreground mt-1 ${msg.senderType === 'USER' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                  {msg.senderType === 'USER' && (
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarImage src={session?.user?.avatarUrl} />
                      <AvatarFallback>{session?.user?.nickname?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Replies */}
      {showQuickReplies && (
        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <span className="text-sm font-medium">快捷回复</span>
            <Button variant="ghost" size="sm" onClick={() => setShowQuickReplies(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply)}
                  className="text-left p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">{reply.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{reply.content}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end space-x-2">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowQuickReplies(!showQuickReplies)}>
                快捷回复
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Image className="h-4 w-4" aria-label="上传图片" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入消息..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>
            <Button onClick={handleSend} disabled={sending || !inputValue.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Close Session Modal */}
      <Modal
        open={closeModalVisible}
        onOpenChange={setCloseModalVisible}
        title="确认结束会话"
      >
        <div className="py-4">
          <p>确定要结束当前会话吗？</p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setCloseModalVisible(false)}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleCloseSession}>
            确认结束
          </Button>
        </div>
      </Modal>
    </div>
  );
}
