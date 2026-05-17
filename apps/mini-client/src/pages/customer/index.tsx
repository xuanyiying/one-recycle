import { logger } from '@/utils/logger'
import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useDidShow, useReady } from '@tarojs/taro';
import { Loading, Popup } from '@nutui/nutui-react-taro';
import { useAuth } from '@/hooks/useAuth';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useSession } from '../../hooks/useSession';
import { useMessages } from '../../hooks/useMessages';
import { upload } from '@/utils/request';
import { cancelOrder } from '@/services/order';
import { ChatMessageList, ChatInput } from '@/components/Chat';
import QuickActions from './components/QuickActions';
import SatisfactionModal from './components/SatisfactionModal';
import OrderCard from './components/OrderCard';
import TicketCard from './components/TicketCard';
import './index.scss';

interface QuickAction {
  type: string;
  label: string;
  data?: any;
}

const CustomerServicePage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const safeArea = useSafeArea();
  const { session, createSession, closeSession, transferToAgent, submitSatisfaction, loading: sessionLoading, isOffline: sessionOffline } = useSession();
  const { messages, sendMessage, loadMessages, hasMore, loading: messagesLoading, clearMessages, retryMessage, removeMessage, isOffline: messagesOffline } = useMessages();
  const { on, emit, connected, connect } = useWebSocket();

  const [inputValue, setInputValue] = useState('');
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [scrollIntoView, setScrollIntoView] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOffline = sessionOffline || messagesOffline;

  useDidShow(() => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/login/index' });
      return;
    }
    initSession();
  });

  useReady(() => {
    setupWebSocketListeners();
  });

  useEffect(() => {
    if (connected) {
      setupWebSocketListeners();
    }
  }, [connected]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const initSession = async () => {
    try {
      if (!isOffline) {
        await connect();
      }

      const newSession = await createSession();
      if (newSession) {
        if (!isOffline) {
          await loadMessages(newSession.id);
          emit('join_session', { sessionId: newSession.id });
        }
      }
    } catch (error) {
      logger.error('Failed to init session:', error);
      Taro.showToast({ title: '初始化失败，请重试', icon: 'none' });
    }
  };

  const setupWebSocketListeners = () => {
    on('message', handleNewMessage);
    on('typing', handleTyping);
    on('agent_joined', handleAgentJoined);
    on('transfer_initiated', handleTransferInitiated);
    on('messages_read', handleMessagesRead);
    on('error', handleError);
  };

  const handleNewMessage = (data: any) => {
    if (data.senderType !== 'USER') {
      setIsTyping(false);
      setQuickActions(data.suggestedActions || []);
    }
  };

  const handleTyping = (data: { userId: string; isTyping: boolean }) => {
    if (data.userId !== user?.id) {
      setIsTyping(data.isTyping);
    }
  };

  const handleAgentJoined = () => {
    Taro.showToast({ title: '客服已接入', icon: 'success' });
  };

  const handleTransferInitiated = (data: { queuePosition: number }) => {
    Taro.showModal({
      title: '转接人工客服',
      content: `您当前排在第 ${data.queuePosition} 位，预计等待 2-5 分钟`,
      showCancel: false,
    });
  };

  const handleMessagesRead = (data: { by: string; count: number }) => {
    logger.log('Messages read:', data);
  };

  const handleError = (data: { message: string }) => {
    Taro.showToast({ title: data.message, icon: 'none' });
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !session) return;

    const content = inputValue.trim();
    setInputValue('');
    setQuickActions([]);

    try {
      await sendMessage({
        sessionId: session.id,
        messageType: 'TEXT',
        content,
      });

      emit('send_message', {
        sessionId: session.id,
        messageType: 'TEXT',
        content,
      });

      scrollToBottom();
    } catch (error) {
      logger.error('Send message failed:', error);
      Taro.showToast({ title: '发送失败，请重试', icon: 'none' });
    }
  }, [inputValue, session, sendMessage, emit]);

  const handleSendImage = useCallback(async () => {
    if (!session) return;

    try {
      const result = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      const tempFilePath = result.tempFilePaths[0] || '';

      Taro.showLoading({ title: '上传中...' });

      const uploadResult = await upload('/customer/upload', tempFilePath);

      Taro.hideLoading();

      if (session) {
        await sendMessage({
        sessionId: session.id,
        messageType: 'IMAGE',
        mediaUrl: uploadResult.url,
      });
      }

      emit('send_message', {
        sessionId: session.id,
        messageType: 'IMAGE',
        mediaUrl: uploadResult.url,
      });

      scrollToBottom();
    } catch (error) {
      Taro.hideLoading();
      logger.error('Upload image failed:', error);
      Taro.showToast({ title: '上传失败', icon: 'none' });
    }
  }, [session, sendMessage, emit]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    switch (action.type) {
      case 'quick_question': {
        const messageToSend = action.label;
        if (!session || !messageToSend.trim()) break;
        setInputValue('');
        setQuickActions([]);
        sendMessage({
          sessionId: session.id,
          messageType: 'TEXT',
          content: messageToSend,
        });
        emit('send_message', {
          sessionId: session.id,
          messageType: 'TEXT',
          content: messageToSend,
        });
        scrollToBottom();
        break;
      }
      case 'order_card':
        break;
      case 'cancel_order':
        handleCancelOrder(action.data?.orderId);
        break;
      case 'transfer':
        handleTransferToAgent();
        break;
      default:
        if (action.label) {
          setInputValue(action.label);
        }
    }
  }, [session, sendMessage, emit]);

  const handleCancelOrder = async (orderId?: string) => {
    if (!orderId) return;

    const result = await Taro.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
    });

    if (result.confirm) {
      try {
        Taro.showLoading({ title: '处理中...' });
        await cancelOrder(orderId);
        Taro.hideLoading();
        Taro.showToast({ title: '订单已取消', icon: 'success' });
      } catch (error) {
        Taro.hideLoading();
        Taro.showToast({ title: '取消失败', icon: 'none' });
      }
    }
  };

  const handleTransferToAgent = async () => {
    if (!session) return;

    const result = await Taro.showModal({
      title: '转接人工客服',
      content: '确定要转接人工客服吗？',
    });

    if (result.confirm) {
      try {
        await transferToAgent(session.id);
        emit('transfer_agent', { sessionId: session.id });
      } catch (error) {
        Taro.showToast({ title: '转接失败', icon: 'none' });
      }
    }
  };

  const handleSatisfactionSubmit = async (rating: number, feedback?: string) => {
    if (!session) return;

    try {
      await submitSatisfaction(session.id, rating, feedback);
      setShowSatisfaction(false);
      Taro.showToast({ title: '感谢您的评价', icon: 'success' });
    } catch (error) {
      Taro.showToast({ title: '提交失败', icon: 'none' });
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      setScrollIntoView(`msg-${Date.now()}`);
    }, 100);
  };

  const handleInputFocus = () => {
    emit('typing', { sessionId: session?.id, isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emit('typing', { sessionId: session?.id, isTyping: false });
    }, 3000);
  };

  const handlePageBack = async () => {
    if (session?.status === 'ACTIVE') {
      const result = await Taro.showModal({
        title: '提示',
        content: '是否结束当前会话？',
        confirmText: '结束',
        cancelText: '继续咨询',
      });

      if (result.confirm) {
        await handleEndSession();
      } else {
        Taro.navigateBack();
      }
    } else {
      Taro.navigateBack();
    }
  };

  const handleEndSession = async () => {
    if (!session) return;

    try {
      Taro.showLoading({ title: '正在结束...' });
      const success = await closeSession(session.id);
      Taro.hideLoading();

      if (success) {
        emit('leave_session', { sessionId: session.id });
        clearMessages();
        setShowSatisfaction(true);
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({ title: '结束失败', icon: 'none' });
    }
  };

  const handleConfirmEndSession = async () => {
    setShowEndConfirm(false);
    await handleEndSession();
  };

  if (sessionLoading) {
    return (
      <View className="customer-page loading">
        <Loading>加载中...</Loading>
      </View>
    );
  }

  return (
    <View className="customer-page">
      <View className="page-header">
        <View className="header-content" style={{ paddingTop: `${safeArea.insetTop + 20}rpx` }}>
          <View className="back-btn" onClick={() => handlePageBack()}>
            <Text>返回</Text>
          </View>
          <Text className="header-title">在线客服</Text>
          <View className="header-actions">
            {/* AI自动回复已禁用，直接连接人工客服 */}
            {/* {session?.type === 'AUTO' && (
              <Button
                className="transfer-btn"
                onClick={handleTransferToAgent}
              >
                转人工
              </Button>
            )} */}
            {session?.status === 'ACTIVE' && (
              <Button
                className="end-btn"
                onClick={() => setShowEndConfirm(true)}
              >
                结束
              </Button>
            )}
          </View>
        </View>
        {!connected && !isOffline && (
          <View className="network-status disconnected">
            <View className="status-dot" />
            <Text>网络已断开，正在重连...</Text>
          </View>
        )}
        {isOffline && (
          <View className="network-status offline">
            <View className="status-dot" />
            <Text>离线模式 - 部分功能受限</Text>
          </View>
        )}
      </View>

      <ChatMessageList
        messages={messages.map(msg => ({
          id: msg.id,
          type: msg.senderType === 'USER' ? 'user' : msg.senderType === 'SYSTEM' ? 'system' : 'bot',
          content: msg.content || '',
          timestamp: msg.createdAt,
          status: msg.status === 'SENDING' ? 'sending' : msg.status === 'FAILED' ? 'failed' : msg.status === 'READ' ? 'read' : 'sent',
          senderName: msg.senderType === 'AGENT' ? '客服' : undefined,  // AI助手已禁用
          messageType: msg.messageType?.toLowerCase() as 'text' | 'image' | 'voice' | undefined,
          mediaUrl: msg.mediaUrl,
        }))}
        isTyping={isTyping}
        userAvatar={user?.avatarUrl}
        scrollIntoView={scrollIntoView}
        onRetry={retryMessage}
        onRemove={removeMessage}
        hasMore={hasMore}
        onLoadMore={() => session && loadMessages(session.id, messages[0]?.id)}
        loading={messagesLoading}
      />

      {messages.some(msg => msg.messageType === 'ORDER_CARD') && (
        <View className="special-cards">
          {messages.filter(msg => msg.messageType === 'ORDER_CARD').map(msg => (
            <OrderCard key={msg.id} data={msg.extraData} />
          ))}
        </View>
      )}

      {messages.some(msg => msg.messageType === 'TICKET_CARD') && (
        <View className="special-cards">
          {messages.filter(msg => msg.messageType === 'TICKET_CARD').map(msg => (
            <TicketCard key={msg.id} data={msg.extraData} />
          ))}
        </View>
      )}

      {quickActions.length > 0 && (
        <QuickActions
          actions={quickActions}
          onAction={handleQuickAction}
        />
      )}

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onImagePick={handleSendImage}
        onFocus={handleInputFocus}
        placeholder="请输入您的问题..."
        showImage={true}
      />

      <SatisfactionModal
        visible={showSatisfaction}
        onClose={() => setShowSatisfaction(false)}
        onSubmit={handleSatisfactionSubmit}
      />

      <Popup
        visible={showEndConfirm}
        position="center"
        round
        onClose={() => setShowEndConfirm(false)}
      >
        <View className="end-confirm-modal">
          <Text className="modal-title">结束会话</Text>
          <Text className="modal-content">确定要结束当前会话吗？结束后将无法继续咨询。</Text>
          <View className="modal-actions">
            <Button className="cancel-btn" onClick={() => setShowEndConfirm(false)}>
              取消
            </Button>
            <Button className="confirm-btn" type="primary" onClick={handleConfirmEndSession}>
              确认结束
            </Button>
          </View>
        </View>
      </Popup>
    </View>
  );
};

export default CustomerServicePage;
