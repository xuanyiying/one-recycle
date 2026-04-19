import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './ChatMessageItem.scss';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date | string;
  status?: 'sending' | 'sent' | 'failed' | 'read';
  senderName?: string;
  avatar?: string;
  step?: string;
  messageType?: 'text' | 'image' | 'voice' | 'order';
  mediaUrl?: string;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  isSelf: boolean;
  userAvatar?: string;
  botAvatar?: string;
  onRetry?: (messageId: string) => void;
  onRemove?: (messageId: string) => void;
  onImagePreview?: (url: string) => void;
  variant?: 'default' | 'compact';
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isSelf,
  userAvatar,
  onRetry,
  onRemove,
  onImagePreview,
  variant = 'default',
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getSenderName = () => {
    if (message.senderName) return message.senderName;
    return message.type === 'user' ? '我' : 'AI助手';
  };

  const getAvatarUrl = () => {
    if (isSelf && userAvatar) return userAvatar;
    if (message.avatar) return message.avatar;
    if (message.type === 'bot') {
      return 'https://img.yzcdn.cn/vant/cat.jpeg';
    }
    return 'https://img.yzcdn.cn/vant/apple-2.jpg';
  };

  const handleImagePreview = (url: string) => {
    if (onImagePreview) {
      onImagePreview(url);
    } else {
      Taro.previewImage({
        current: url,
        urls: [url],
      });
    }
  };

  const handleLongPress = () => {
    if (isSelf && (message.status === 'failed' || message.status === 'sent')) {
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
      case 'sending':
        return <Text className="status-icon sending">⏳</Text>;
      case 'failed':
        return (
          <View className="status-failed" onClick={handleRetry}>
            <Text className="status-icon failed">❌</Text>
            <Text className="retry-text">点击重试</Text>
          </View>
        );
      case 'read':
        return <Text className="status-icon read">✓✓</Text>;
      case 'sent':
        return <Text className="status-icon sent">✓</Text>;
      default:
        return null;
    }
  };

  if (message.type === 'system') {
    return (
      <View className="chat-message-item system">
        <View className="system-message">
          <Text className="system-text">{message.content}</Text>
        </View>
        <Text className="message-time">{formatTime(message.timestamp)}</Text>
      </View>
    );
  }

  return (
    <View className={`chat-message-item ${isSelf ? 'self' : 'other'} ${variant}`}>
      {!isSelf && (
        <Image
          className="avatar"
          src={getAvatarUrl()}
          mode="aspectFill"
        />
      )}

      <View className="message-content">
        {!isSelf && (
          <View className="sender-info">
            <Text className="sender-name">{getSenderName()}</Text>
            {message.step && (
              <Text className="step-label">{message.step}</Text>
            )}
          </View>
        )}

        <View
          className="message-bubble"
          onLongPress={handleLongPress}
        >
          {(!message.messageType || message.messageType === 'text') && (
            <Text className="message-text">{message.content}</Text>
          )}

          {message.messageType === 'image' && message.mediaUrl && (
            <Image
              className="message-image"
              src={message.mediaUrl}
              mode="widthFix"
              onClick={() => handleImagePreview(message.mediaUrl!)}
            />
          )}

          {message.messageType === 'voice' && (
            <View className="message-voice">
              <Text className="voice-icon">🎤</Text>
              <Text className="voice-text">语音消息</Text>
            </View>
          )}
        </View>

        <View className="message-meta">
          <Text className="message-time">{formatTime(message.timestamp)}</Text>
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
            {message.status === 'failed' && (
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

export default ChatMessageItem;
