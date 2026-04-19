import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Text } from '@tarojs/components';
import ChatMessageItem, { ChatMessage } from './ChatMessageItem';
import './ChatMessageList.scss';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  userAvatar?: string;
  botAvatar?: string;
  scrollIntoView?: string;
  initialPrompt?: string;
  onRetry?: (messageId: string) => void;
  onRemove?: (messageId: string) => void;
  onImagePreview?: (url: string) => void;
  variant?: 'default' | 'compact';
  hasMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isTyping = false,
  userAvatar,
  botAvatar,
  scrollIntoView,
  initialPrompt,
  onRetry,
  onRemove,
  onImagePreview,
  variant = 'default',
  hasMore = false,
  onLoadMore,
  loading = false,
}) => {
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      const lastMessage = messages[messages.length - 1];
      const lastMessageId = lastMessage ? `msg-${lastMessage.id}` : '';
      if (lastMessageId) {
        setTimeout(() => {
          scrollViewRef.current?.scrollIntoView?.({ selector: `#${lastMessageId}` });
        }, 100);
      }
    }
  }, [messages]);

  const handleScrollToUpper = () => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      className="chat-message-list"
      scrollY
      scrollWithAnimation
      scrollIntoView={scrollIntoView}
      enhanced
      showScrollbar={false}
      onScrollToUpper={handleScrollToUpper}
      upperThreshold={100}
    >
      <View className="message-list-container">
        {loading && hasMore && (
          <View className="loading-more">
            <View className="loading-spinner" />
            <Text className="loading-text">加载中...</Text>
          </View>
        )}

        {initialPrompt && messages.length === 0 && (
          <View className="system-message-wrapper">
            <View className="system-message">
              <View className="system-message-icon">💡</View>
              <Text className="system-message-text">{initialPrompt}</Text>
            </View>
          </View>
        )}

        {messages.map((message) => (
          <View key={message.id} id={`msg-${message.id}`}>
            <ChatMessageItem
              message={message}
              isSelf={message.type === 'user'}
              userAvatar={userAvatar}
              botAvatar={botAvatar}
              onRetry={onRetry}
              onRemove={onRemove}
              onImagePreview={onImagePreview}
              variant={variant}
            />
          </View>
        ))}

        {isTyping && (
          <View className="typing-indicator-wrapper">
            <View className="typing-avatar">
              <Text className="avatar-text">🤖</Text>
            </View>
            <View className="typing-indicator">
              <View className="typing-dot" />
              <View className="typing-dot" />
              <View className="typing-dot" />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ChatMessageList;
