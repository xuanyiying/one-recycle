import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import './ChatInput.scss';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  onVoiceCancel?: () => void;
  onImagePick?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  disabled?: boolean;
  showVoice?: boolean;
  showImage?: boolean;
  isRecording?: boolean;
  isRecognizing?: boolean;
  duration?: number;
  variant?: 'default' | 'minimal';
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onVoiceStart,
  onVoiceStop,
  onVoiceCancel,
  onImagePick,
  onFocus,
  placeholder = '请输入您的消息...',
  disabled = false,
  showVoice = false,
  showImage = false,
  isRecording = false,
  isRecognizing = false,
  duration = 0,
  variant = 'default',
}) => {
  const [inputMode, setInputMode] = useState<'text' | 'voice'>(showVoice ? 'voice' : 'text');

  const handleSend = () => {
    if (value.trim()) {
      onSend();
    }
  };

  const handleVoiceTouchStart = () => {
    onVoiceStart?.();
  };

  const handleVoiceTouchEnd = () => {
    onVoiceStop?.();
  };

  const handleVoiceTouchCancel = () => {
    onVoiceCancel?.();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleInputMode = () => {
    setInputMode(inputMode === 'text' ? 'voice' : 'text');
  };

  return (
    <View className={`chat-input-container ${variant}`}>
      {showVoice && (
        <View className="input-mode-toggle" onClick={toggleInputMode}>
          {inputMode === 'text' ? (
            <Text className="toggle-icon">🎤</Text>
          ) : (
            <Text className="toggle-icon">⌨️</Text>
          )}
        </View>
      )}

      {showImage && inputMode === 'text' && (
        <View className="action-button" onClick={onImagePick}>
          <Text className="action-icon">📷</Text>
        </View>
      )}

      {inputMode === 'text' ? (
        <View className="text-input-wrapper">
          <Input
            className="text-input"
            placeholder={placeholder}
            value={value}
            onInput={(e) => onChange(e.detail.value)}
            onConfirm={handleSend}
            onFocus={onFocus}
            confirmType="send"
            disabled={disabled}
            placeholderStyle="color: #90A4AE;"
          />
          <Button
            className={`send-btn ${!value.trim() ? 'disabled' : ''}`}
            onClick={handleSend}
            disabled={!value.trim() || disabled}
          >
            发送
          </Button>
        </View>
      ) : (
        <View className="voice-input-wrapper">
          {isRecognizing ? (
            <View className="voice-button recognizing">
              <Text className="button-icon">🎤</Text>
              <Text className="button-text">识别中...</Text>
            </View>
          ) : (
            <View
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              onTouchStart={handleVoiceTouchStart}
              onTouchEnd={handleVoiceTouchEnd}
              onTouchCancel={handleVoiceTouchCancel}
            >
              {isRecording ? (
                <>
                  <View className="recording-dot" />
                  <Text className="duration-text">{formatDuration(duration)}</Text>
                  <Text className="button-text">松开结束</Text>
                </>
              ) : (
                <>
                  <Text className="button-icon">🎤</Text>
                  <Text className="button-text">按住说话</Text>
                </>
              )}
            </View>
          )}
        </View>
      )}

      {isRecording && (
        <View className="recording-ripple">
          <View className="ripple" />
          <View className="ripple" />
          <View className="ripple" />
        </View>
      )}
    </View>
  );
};

export default ChatInput;
