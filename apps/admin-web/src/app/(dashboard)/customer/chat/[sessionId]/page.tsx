'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Image, History, X, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sessionId: string;
  senderType: 'USER' | 'AGENT' | 'SYSTEM' | 'AI';
  senderId?: string;
  messageType: 'TEXT' | 'IMAGE' | 'ORDER_CARD' | 'TICKET_CARD';
  content?: string;
  mediaUrl?: string;
  extraData?: any;
  createdAt: string;
}

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

export default function ChatPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSession();
    fetchMessages();
    fetchQuickReplies();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/customer/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customer/sessions/${sessionId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('获取消息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuickReplies = async () => {
    try {
      const res = await fetch('/api/customer/quick-replies');
      if (res.ok) {
        const data = await res.json();
        setQuickReplies(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch quick replies:', error);
    }
  };

  const connectWebSocket = () => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.onerecycle.com/customer';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) return;

      wsRef.current = new WebSocket(`${wsUrl}?token=${token}`);

      wsRef.current.onopen = () => {
        wsRef.current?.send(JSON.stringify({
          event: 'join_session',
          data: { sessionId },
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const { event: eventType, data } = JSON.parse(event.data);

          switch (eventType) {
            case 'message':
              setMessages((prev) => [...prev, data]);
              break;
            case 'typing':
              break;
            case 'agent_joined':
              toast.success('客服已接入');
              break;
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string, messageType: 'TEXT' | 'IMAGE' = 'TEXT', mediaUrl?: string) => {
    if (!content.trim() && !mediaUrl) return;

    setSending(true);
    try {
      const res = await fetch('/api/customer/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messageType,
          content,
          mediaUrl,
        }),
      });

      if (res.ok) {
        setInputValue('');
      } else {
        toast.error('发送失败');
      }
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/customer/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        sendMessage('', 'IMAGE', data.url);
      } else {
        toast.error('上传失败');
      }
    } catch (error) {
      toast.error('上传失败');
    }
  };

  const handleCloseSession = async () => {
    try {
      const res = await fetch(`/api/customer/sessions/${sessionId}/close`, {
        method: 'PUT',
      });

      if (res.ok) {
        toast.success('会话已结束');
        window.history.back();
      } else {
        toast.error('操作失败');
      }
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
                      <img
                        src={msg.mediaUrl}
                        alt="图片"
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
                <Image className="h-4 w-4" />
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
