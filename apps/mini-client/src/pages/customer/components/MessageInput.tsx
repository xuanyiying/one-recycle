import React from 'react';
import { View, Input, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onSendImage: () => void;
  onFocus?: () => void;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onSendImage,
  onFocus,
  placeholder = '请输入您的问题...',
}) => {
  const handleSend = () => {
    if (value.trim()) {
      onSend();
    }
  };

  const handleVoiceRecord = () => {
    Taro.showModal({
      title: '语音消息',
      content: '语音消息功能开发中，敬请期待',
      showCancel: false,
    });
  };

  return (
    <View className="message-input-container">
      <View className="action-buttons">
        <Button className="action-btn" onClick={onSendImage}>
          <Text className="action-icon">📷</Text>
        </Button>
        <Button className="action-btn" onClick={handleVoiceRecord}>
          <Text className="action-icon">🎤</Text>
        </Button>
      </View>
      <View className="input-wrapper">
        <Input
          className="text-input"
          placeholder={placeholder}
          value={value}
          onInput={(e) => onChange(e.detail.value)}
          onConfirm={handleSend}
          onFocus={onFocus}
          confirmType="send"
          placeholderStyle="color: #90A4AE;"
        />
      </View>
      <Button
        className="send-btn"
        disabled={!value.trim()}
        onClick={handleSend}
      >
        发送
      </Button>
    </View>
  );
};

export default MessageInput;
