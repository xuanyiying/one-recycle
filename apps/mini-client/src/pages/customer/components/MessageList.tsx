import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ChatMessage } from '@/hooks/useMessages';

interface MessageListProps {
  message: ChatMessage;
  isSelf: boolean;
  userAvatar?: string;
  onRetry?: (messageId: string) => void;
  onRemove?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  message,
  isSelf,
  userAvatar,
  onRetry,
  onRemove
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSenderName = () => {
    switch (message.senderType) {
      case 'USER':
        return '我';
      case 'AGENT':
        return '客服';
      case 'AI':
        return 'AI助手';
      case 'SYSTEM':
        return '系统';
      default:
        return '客服';
    }
  };

  const getAvatarUrl = () => {
    if (isSelf && userAvatar) {
      return userAvatar;
    }
    if (message.senderType === 'AI') {
      return 'https://img.yzcdn.cn/vant/cat.jpeg';
    }
    if (message.senderType === 'SYSTEM') {
      return '';
    }
    return 'https://img.yzcdn.cn/vant/apple-2.jpg';
  };

  const handleImagePreview = (url: string) => {
    Taro.previewImage({
      current: url,
      urls: [url],
    });
  };

  const handleLongPress = () => {
    if (isSelf && (message.status === 'FAILED' || message.status === 'SENT')) {
      setShowActions(true);
    }
  };

  const handleRetry = () => {
    setShowActions(false);
    onRetry?.(message.id);
  };

  const handleRemove = () => {
    setShowActions(false);
    onRemove?.(message.id);
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'SENDING':
        return <Text className="status-icon sending">⏳</Text>;
      case 'FAILED':
        return (
          <View className="status-failed" onClick={handleRetry}>
            <Text className="status-icon failed">❌</Text>
            <Text className="retry-text">点击重试</Text>
          </View>
        );
      case 'READ':
        return <Text className="status-icon read">✓✓</Text>;
      case 'SENT':
        return <Text className="status-icon sent">✓</Text>;
      default:
        return null;
    }
  };

  if (message.senderType === 'SYSTEM') {
    return (
      <View className="message-item system">
        <View className="system-message">
          <Text className="system-text">{message.content}</Text>
        </View>
        <Text className="message-time">{formatTime(message.createdAt)}</Text>
      </View>
    );
  }

  return (
    <View className={`message-item ${isSelf ? 'self' : 'other'}`}>
      {!isSelf && (
        <Image
          className="avatar"
          src={getAvatarUrl()}
          mode="aspectFill"
        />
      )}

      <View className="message-content">
        {!isSelf && (
          <Text className="sender-name">{getSenderName()}</Text>
        )}

        <View
          className="message-bubble"
          onLongPress={handleLongPress}
        >
          {message.messageType === 'TEXT' && (
            <Text className="message-text">{message.content}</Text>
          )}

          {message.messageType === 'IMAGE' && message.mediaUrl && (
            <Image
              className="message-image"
              src={message.mediaUrl}
              mode="widthFix"
              onClick={() => handleImagePreview(message.mediaUrl!)}
            />
          )}

          {message.messageType === 'VOICE' && (
            <View className="message-voice">
              <Text className="voice-icon">🎤</Text>
              <Text className="voice-text">语音消息</Text>
            </View>
          )}
        </View>

        <View className="message-meta">
          <Text className="message-time">{formatTime(message.createdAt)}</Text>
          {isSelf && getStatusIcon()}
        </View>
      </View>

      {isSelf && (
        <Image
          className="avatar"
          src={userAvatar || 'https://img.yzcdn.cn/vant/apple-2.jpg'}
          mode="aspectFill"
        />
      )}

      {showActions && (
        <View className="message-actions-mask" onClick={() => setShowActions(false)}>
          <View className="message-actions" onClick={(e) => e.stopPropagation()}>
            {message.status === 'FAILED' && (
              <View className="action-item" onClick={handleRetry}>
                <Text>重新发送</Text>
              </View>
            )}
            <View className="action-item" onClick={handleRemove}>
              <Text>删除消息</Text>
            </View>
            <View className="action-item cancel" onClick={() => setShowActions(false)}>
              <Text>取消</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default MessageList;
