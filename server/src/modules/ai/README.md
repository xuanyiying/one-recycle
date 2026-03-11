# AI 大模型模块

统一的多平台 AI 大模型接入模块，支持 OpenAI、百度文心一言、阿里通义千问、腾讯混元等主流平台。

## 功能特性

- **多平台支持**：OpenAI、百度 ERNIE、阿里 Qwen、腾讯 Hunyuan
- **统一接口**：所有平台使用相同的调用方式
- **智能路由**：支持优先级、轮询、随机、健康检查等多种选择策略
- **自动故障转移**：单个平台失败时自动切换到其他平台
- **会话管理**：支持多轮对话和上下文保持
- **工具调用**：支持 Function Calling，可调用业务系统功能

## 快速开始

### 1. 配置环境变量

```bash
# 默认使用的 AI 提供商
AI_DEFAULT_PROVIDER=openai

# 模型选择策略
AI_SELECTION_STRATEGY=priority

# OpenAI 配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# 百度文心一言配置
BAIDU_API_KEY=your-baidu-api-key
BAIDU_API_SECRET=your-baidu-api-secret
BAIDU_MODEL=ernie-bot-turbo

# 阿里通义千问配置
ALIYUN_API_KEY=your-aliyun-api-key
ALIYUN_MODEL=qwen-turbo

# 腾讯混元配置
TENCENT_API_KEY=your-tencent-secret-id
TENCENT_API_SECRET=your-tencent-secret-key
TENCENT_MODEL=hunyuan-lite
```

### 2. 在模块中导入

```typescript
import { AIModule } from '@/modules/ai';

@Module({
  imports: [AIModule],
})
export class YourModule {}
```

### 3. 使用 AI 服务

```typescript
import { Injectable } from '@nestjs/common';
import { AIService, AIRequest, AIProviderType } from '@/modules/ai';

@Injectable()
export class YourService {
  constructor(private readonly aiService: AIService) {}

  async chatWithAI() {
    const result = await this.aiService.chat({
      messages: [
        { role: 'system', content: '你是专业的AI助手。' },
        { role: 'user', content: '查询我的订单' },
      ],
      config: {
        temperature: 0.7,
        maxTokens: 1000,
      },
    });

    if (result.success) {
      console.log('AI 回复:', result.response.content);
      console.log('使用的提供商:', result.response.provider);
      console.log('响应时间:', result.latency, 'ms');
    } else {
      console.error('请求失败:', result.error);
    }
  }

  // 指定使用特定提供商
  async chatWithSpecificProvider() {
    const result = await this.aiService.chat(
      {
        messages: [{ role: 'user', content: '你好' }],
      },
      AIProviderType.BAIDU, // 指定使用百度
    );
  }
}
```

### 4. 使用工具调用 (Function Calling)

```typescript
const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'query_order',
      description: '查询订单信息',
      parameters: {
        type: 'object',
        properties: {
          orderNo: { type: 'string', description: '订单号' },
        },
        required: ['orderNo'],
      },
    },
  },
];

const result = await this.aiService.chat({
  messages: [{ role: 'user', content: '查询订单 12345' }],
  tools,
  toolChoice: 'auto',
});

if (result.response.toolCalls) {
  // 处理工具调用
  for (const toolCall of result.response.toolCalls) {
    console.log('调用工具:', toolCall.function.name);
    console.log('参数:', toolCall.function.arguments);
  }
}
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `AI_DEFAULT_PROVIDER` | 默认使用的 AI 提供商 | `openai` |
| `AI_SELECTION_STRATEGY` | 模型选择策略 | `priority` |
| `{PROVIDER}_API_KEY` | 各平台的 API Key | - |
| `{PROVIDER}_API_SECRET` | 需要 Secret 的平台（百度、腾讯） | - |
| `{PROVIDER}_BASE_URL` | 自定义 API 地址 | 平台默认值 |
| `{PROVIDER}_MODEL` | 默认模型 | 平台推荐模型 |
| `{PROVIDER}_TIMEOUT` | 请求超时时间 | 30000ms |

### 模型选择策略

- **priority**: 按配置顺序优先使用第一个可用的
- **round_robin**: 轮询使用各平台
- **random**: 随机选择
- **health_check**: 优先使用健康状态良好的

## 支持的模型

### OpenAI
- gpt-4o
- gpt-4o-mini
- gpt-4-turbo
- gpt-3.5-turbo

### 百度文心一言
- ernie-bot (文心一言)
- ernie-bot-turbo (文心一言 Turbo)
- ernie-bot-4 (文心一言 4.0)
- ernie-speed (文心 Speed)

### 阿里通义千问
- qwen-turbo
- qwen-plus
- qwen-max
- qwen-coder-plus

### 腾讯混元
- hunyuan-lite
- hunyuan-standard
- hunyuan-pro

## API 参考

### AIService

#### chat(request, preferredProvider?)

发送聊天请求。

**参数：**
- `request`: `AIRequest` - 请求参数
  - `messages`: 消息列表
  - `tools`: 工具定义（可选）
  - `toolChoice`: 工具选择策略（可选）
  - `config`: 请求配置（可选）
- `preferredProvider`: `AIProviderType` - 优先使用的提供商（可选）

**返回：** `Promise<AICallResult>`

#### healthCheck()

检查所有提供商的健康状态。

**返回：** `Promise<Record<AIProviderType, boolean>>`

#### getProviderStatus()

获取所有提供商的详细状态。

**返回：** 提供商状态数组

## 错误处理

```typescript
const result = await this.aiService.chat(request);

if (!result.success) {
  console.error('错误代码:', result.error.code);
  console.error('错误信息:', result.error.message);
  console.error('出错的提供商:', result.error.provider);
}
```

## 最佳实践

1. **配置多个提供商**：建议至少配置 2-3 个平台，确保服务可用性
2. **合理设置超时**：根据业务场景调整超时时间
3. **使用工具调用**：对于需要查询数据库的操作，使用 Function Calling
4. **监控健康状态**：定期检查各平台健康状态
5. **优雅降级**：当所有 AI 服务不可用时，提供备用方案

## 示例代码

见 `examples/` 目录下的完整示例：
- `basic-chat.example.ts` - 基础对话示例
- `function-calling.example.ts` - 工具调用示例
- `multi-provider.example.ts` - 多平台配置示例
