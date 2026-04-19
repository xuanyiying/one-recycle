# ChatUI 组件库

统一的聊天UI组件库，提供清新自然环保主题设计的聊天界面组件。

## 组件列表

### ChatMessageItem

单个消息项组件，支持文本、图片、语音消息显示。

#### Props

```typescript
interface ChatMessageItemProps {
  message: ChatMessage;           // 消息对象
  isSelf: boolean;                // 是否是自己发送的消息
  userAvatar?: string;            // 用户头像URL
  botAvatar?: string;             // 机器人头像URL
  onRetry?: (messageId: string) => void;    // 重试回调
  onRemove?: (messageId: string) => void;   // 删除回调
  onImagePreview?: (url: string) => void;   // 图片预览回调
  variant?: 'default' | 'compact';          // 显示变体
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date | string;
  status?: 'sending' | 'sent' | 'failed' | 'read';
  senderName?: string;
  avatar?: string;
  step?: string;
  messageType?: 'text' | 'image' | 'voice';
  mediaUrl?: string;
}
```

#### 使用示例

```tsx
import { ChatMessageItem } from '@/components/ChatUI';

<ChatMessageItem
  message={{
    id: '1',
    type: 'user',
    content: '你好',
    timestamp: new Date(),
    status: 'sent',
  }}
  isSelf={true}
  userAvatar="https://example.com/avatar.jpg"
/>
```

---

### ChatMessageList

消息列表组件，支持滚动加载、输入指示器等功能。

#### Props

```typescript
interface ChatMessageListProps {
  messages: ChatMessage[];         // 消息数组
  isTyping?: boolean;              // 是否显示输入指示器
  userAvatar?: string;             // 用户头像URL
  botAvatar?: string;              // 机器人头像URL
  scrollIntoView?: string;         // 滚动到指定消息ID
  initialPrompt?: string;          // 初始提示信息
  onRetry?: (messageId: string) => void;     // 重试回调
  onRemove?: (messageId: string) => void;    // 删除回调
  onImagePreview?: (url: string) => void;    // 图片预览回调
  variant?: 'default' | 'compact';           // 显示变体
  hasMore?: boolean;               // 是否有更多历史消息
  onLoadMore?: () => void;         // 加载更多回调
  loading?: boolean;               // 是否正在加载
}
```

#### 使用示例

```tsx
import { ChatMessageList } from '@/components/ChatUI';

<ChatMessageList
  messages={messages}
  isTyping={isBotTyping}
  userAvatar={user?.avatar}
  onRetry={handleRetry}
  hasMore={hasMore}
  onLoadMore={loadMoreMessages}
/>
```

---

### ChatInput

聊天输入组件，支持文本输入、语音输入、图片选择等功能。

#### Props

```typescript
interface ChatInputProps {
  value: string;                   // 输入值
  onChange: (value: string) => void;  // 值变化回调
  onSend: () => void;              // 发送回调
  onVoiceStart?: () => void;       // 开始录音回调
  onVoiceStop?: () => void;        // 停止录音回调
  onVoiceCancel?: () => void;      // 取消录音回调
  onImagePick?: () => void;        // 选择图片回调
  onFocus?: () => void;            // 获得焦点回调
  placeholder?: string;            // 占位文本
  disabled?: boolean;              // 是否禁用
  showVoice?: boolean;             // 是否显示语音输入
  showImage?: boolean;             // 是否显示图片选择
  isRecording?: boolean;           // 是否正在录音
  isRecognizing?: boolean;         // 是否正在识别
  duration?: number;               // 录音时长（秒）
  variant?: 'default' | 'minimal'; // 显示变体
}
```

#### 使用示例

```tsx
import { ChatInput } from '@/components/ChatUI';

// 文本输入模式
<ChatInput
  value={inputValue}
  onChange={setInputValue}
  onSend={handleSend}
  placeholder="请输入消息..."
/>

// 语音+文本输入模式
<ChatInput
  value={inputValue}
  onChange={setInputValue}
  onSend={handleSend}
  showVoice={true}
  showImage={true}
  onVoiceStart={startRecording}
  onVoiceStop={stopRecording}
  onImagePick={pickImage}
  isRecording={isRecording}
  duration={recordingDuration}
/>
```

## 设计规范

### 色彩方案

- 主色调：`#1E7A3E` (环保绿)
- 渐变色：`#1E7A3E` → `#2a8f53`
- 背景渐变：`#F8FAF7` → `#EEF2ED`
- 文字颜色：`#1D2B24` (深色), `#546E7A` (灰色)
- 强调色：`#7FD39A` (浅绿)

### 间距规范

- 消息间距：`32rpx`
- 内边距：`20-28rpx`
- 圆角：`24rpx` (气泡), `48rpx` (按钮)

### 动画效果

- 消息淡入：`0.3s ease-out`
- 输入指示器：`1.4s ease-in-out infinite`
- 按钮交互：`0.3s ease`

## 从旧组件迁移

### 从 VoiceOrderFlow 迁移

```tsx
// 旧代码
import ChatMessageList from '@/components/VoiceOrderFlow/ChatMessageList';

// 新代码
import { ChatMessageList } from '@/components/ChatUI';

// 需要转换消息格式
const convertedMessages = messages.map(msg => ({
  id: msg.id,
  type: msg.type === 'user' ? 'user' : 'bot',
  content: msg.text,
  timestamp: msg.timestamp,
  step: msg.step,
}));
```

### 从 customer/components 迁移

```tsx
// 旧代码
import MessageList from './components/MessageList';

// 新代码
import { ChatMessageList } from '@/components/ChatUI';

// 消息格式基本兼容，只需调整字段名
const convertedMessages = messages.map(msg => ({
  ...msg,
  type: msg.senderType === 'USER' ? 'user' : 'bot',
  content: msg.content || '',
  timestamp: msg.createdAt,
  messageType: msg.messageType?.toLowerCase(),
}));
```

## 最佳实践

1. **消息ID唯一性**：确保每条消息的ID全局唯一
2. **时间戳格式**：推荐使用 `Date` 对象或 ISO 字符串
3. **头像URL**：提供有效的URL或使用默认头像
4. **错误处理**：为 `onRetry` 和 `onRemove` 提供回调处理失败消息
5. **性能优化**：对于大量消息，使用虚拟滚动或分页加载

## 注意事项

- 组件已适配安全区域（刘海屏）
- 支持深色模式（通过CSS变量）
- 所有交互都有触摸反馈
- 图片消息支持点击预览
- 语音消息需要配合录音API使用
