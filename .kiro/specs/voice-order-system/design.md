# 语音自动录入回收订单信息功能系统 - 设计文档

## 1. 系统架构设计

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         小程序端 (Taro + React)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ VoiceDialog  │  │  VoiceInput  │  │ InfoSummary  │          │
│  │   组件       │  │   组件       │  │   组件       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │        VoiceOrderStore (状态管理)                 │           │
│  │  - dialogState    - collectedData                 │           │
│  │  - recognitionStatus - errorMessage               │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ useVoice     │  │ useVoice     │  │ VoiceOrder   │          │
│  │ Recognition  │  │ Dialog       │  │ Service      │          │
│  │   Hook       │  │   Hook       │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS / WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      服务端 (NestJS)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │              VoiceOrderController                │           │
│  │  - POST /api/voice-order/recognize               │           │
│  │  - GET  /api/voice-order/session/:id             │           │
│  │  - POST /api/voice-order/session                 │           │
│  │  - POST /api/voice-order/create                  │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │              VoiceOrderService                   │           │
│  │  - 管理对话状态                                   │           │
│  │  - 协调意图识别、实体抽取、订单创建               │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ IntentEngine │  │ EntityEngine │  │ DialogFlow   │          │
│  │  意图识别    │  │  实体抽取    │  │  对话流管理  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ ASRProvider  │  │ AddressParser│  │ QuantityParser│         │
│  │  语音识别    │  │  地址解析    │  │  数量解析    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      外部服务                                    │
├─────────────────────────────────────────────────────────────────┤
│  微信小程序 ASR  │  腾讯云 ASR  │  Redis  │  PostgreSQL         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈选型

#### 小程序端
- **框架**: Taro 3.x + React 18 + TypeScript
- **状态管理**: Zustand (与现有 orderStore 整合)
- **语音采集**: Taro.getRecorderManager / wx.getRecorderManager
- **语音识别**: 
  - 方案 1: 微信小程序原生 wx.createVoiceRecognitionManager
  - 方案 2: 上传音频到服务端，服务端调用腾讯云 ASR
- **UI 组件**: 基于现有组件库 + 自定义语音交互组件
- **样式**: SCSS (与现有项目一致)

#### 服务端
- **框架**: NestJS 10.x + TypeScript
- **ORM**: Prisma (与现有项目一致)
- **数据库**: PostgreSQL 14+
- **缓存**: Redis 6+ (对话状态缓存)
- **消息队列**: Bull (基于 Redis，与现有 queue 模块整合)
- **ASR 服务**: 
  - 微信小程序 ASR (优先，免费额度)
  - 腾讯云 ASR (备用，高精度)
- **NLP 工具**: 
  - node-segment (中文分词)
  - node-nlp (意图识别，可选)

## 2. 详细设计

### 2.1 小程序端设计

#### 2.1.1 组件结构设计

```
VoiceOrderFlow (主容器)
├── VoiceDialog (对话界面)
│   ├── DialogMessage (对话消息)
│   │   ├── BotMessage (机器人消息)
│   │   └── UserMessage (用户消息)
│   └── DialogList (对话列表，虚拟滚动)
├── InfoSummary (已收集信息摘要)
│   ├── InfoItem (信息项)
│   └── ProgressIndicator (进度指示器)
├── VoiceInput (语音输入)
│   ├── VoiceButton (语音按钮)
│   ├── VoiceWaveform (音量波形动画)
│   └── VoiceStatus (语音状态提示)
└── ManualForm (手动表单，可选切换)
    ├── ItemSelector (物品选择器)
    ├── QuantityInput (数量输入)
    └── AddressForm (地址表单)
```

#### 2.1.2 状态管理设计 (VoiceOrderStore)

```typescript
interface VoiceOrderState {
  // 会话状态
  sessionId: string | null;
  isActive: boolean;
  
  // 对话状态
  currentStep: DialogStep;
  dialogMessages: DialogMessage[];
  isBotTyping: boolean;
  
  // 已收集的数据
  collectedData: CollectedData;
  completedFields: FieldName[];
  
  // 语音识别状态
  recognitionStatus: 'idle' | 'recording' | 'recognizing' | 'success' | 'failed';
  recognizedText: string;
  recognitionError?: string;
  
  // 提交状态
  isSubmitting: boolean;
  submitError?: string;
  
  // 配置
  allowManualSwitch: boolean;
  enableTTS: boolean;
  
  // Actions
  actions: {
    // 会话管理
    startSession: () => Promise<void>;
    endSession: () => void;
    
    // 对话管理
    addBotMessage: (text: string, step?: DialogStep) => void;
    addUserMessage: (text: string) => void;
    moveToStep: (step: DialogStep) => void;
    
    // 数据收集
    updateCollectedData: (data: Partial<CollectedData>) => void;
    markFieldCompleted: (field: FieldName) => void;
    clearField: (field: FieldName) => void;
    
    // 语音识别
    setRecognitionStatus: (status: RecognitionStatus) => void;
    setRecognizedText: (text: string) => void;
    setRecognitionError: (error: string) => void;
    
    // 提交
    submitOrder: () => Promise<OrderResult>;
    
    // 重置
    reset: () => void;
  };
}
```

#### 2.1.3 语音识别 Hook (useVoiceRecognition)

```typescript
interface UseVoiceRecognitionOptions {
  onRecognitionStart?: () => void;
  onRecognitionComplete?: (text: string) => void;
  onError?: (error: Error) => void;
  maxDuration?: number; // 最大录音时长 (秒)
  minDuration?: number; // 最小录音时长 (秒)
}

interface UseVoiceRecognitionReturn {
  // 状态
  isRecording: boolean;
  isRecognizing: boolean;
  recognizedText: string;
  error?: string;
  
  // 控制
  startRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  
  // 音频信息
  duration: number; // 录音时长
  fileSize: number; // 文件大小
}

// 实现要点:
// 1. 使用 Taro.getRecorderManager 录音
// 2. 录音完成后上传到服务端或使用微信 ASR
// 3. 支持录音取消 (上滑)
// 4. 实时音量检测用于波形动画
```

#### 2.1.4 对话流程 Hook (useVoiceDialog)

```typescript
interface UseVoiceDialogOptions {
  sessionId: string;
  currentStep: DialogStep;
  collectedData: CollectedData;
}

interface UseVoiceDialogReturn {
  // 处理识别结果
  processRecognitionResult: (text: string) => Promise<void>;
  
  // 获取当前步骤的引导话术
  getCurrentPrompt: () => string;
  
  // 跳转到下一步
  nextStep: () => void;
  
  // 跳转到指定步骤
  goToStep: (step: DialogStep) => void;
  
  // 信息验证
  validateCurrentStep: () => boolean;
  
  // 信息汇总
  getSummary: () => string;
}
```

### 2.2 服务端设计

#### 2.2.1 模块结构

```typescript
// voice-order.module.ts
@Module({
  imports: [
    PrismaModule,
    RedisModule,
    QueueModule, // 复用现有消息队列
    HttpModule,  // 用于调用外部 ASR API
  ],
  controllers: [VoiceOrderController],
  providers: [
    VoiceOrderService,
    VoiceOrderGateway, // WebSocket 网关 (可选)
    IntentEngine,
    EntityEngine,
    DialogFlowEngine,
    ASRProvider,
    AddressParser,
    QuantityParser,
  ],
  exports: [VoiceOrderService],
})
export class VoiceOrderModule {}
```

#### 2.2.2 意图识别引擎 (IntentEngine)

```typescript
enum VoiceOrderIntent {
  // 物品相关
  PROVIDE_ITEM_TYPE = 'PROVIDE_ITEM_TYPE',      // 提供物品类型
  PROVIDE_QUANTITY = 'PROVIDE_QUANTITY',        // 提供数量
  PROVIDE_ADDRESS = 'PROVIDE_ADDRESS',          // 提供地址
  PROVIDE_CONTACT = 'PROVIDE_CONTACT',          // 提供联系方式
  PROVIDE_TIME = 'PROVIDE_TIME',                // 提供时间
  
  // 控制相关
  SKIP_STEP = 'SKIP_STEP',                      // 跳过当前步骤
  REPEAT_PROMPT = 'REPEAT_PROMPT',              // 重复提示
  GO_BACK = 'GO_BACK',                          // 返回上一步
  SWITCH_TO_MANUAL = 'SWITCH_TO_MANUAL',        // 切换到手动填写
  
  // 确认相关
  CONFIRM_ORDER = 'CONFIRM_ORDER',              // 确认订单
  MODIFY_INFO = 'MODIFY_INFO',                  // 修改信息
  CANCEL_ORDER = 'CANCEL_ORDER',                // 取消订单
  
  // 其他
  UNKNOWN = 'UNKNOWN',                          // 未知意图
}

interface IntentRecognitionResult {
  intent: VoiceOrderIntent;
  confidence: number;
  matchedKeywords?: string[];
  entities?: Record<string, any>;
}

@Injectable()
export class IntentEngine {
  private readonly intentPatterns: Map<VoiceOrderIntent, RegExp[]> = new Map();
  private readonly itemTypes: Set<string> = new Set();
  
  constructor(
    private readonly prisma: PrismaService,
  ) {
    this.initializePatterns();
    this.loadItemTypes();
  }
  
  async recognize(text: string, context: DialogContext): Promise<IntentRecognitionResult> {
    // 1. 文本预处理
    const normalizedText = this.normalizeText(text);
    
    // 2. 基于规则的意图识别
    const ruleBasedResult = this.ruleBasedRecognition(normalizedText, context);
    
    // 3. 如果规则识别置信度低，尝试基于关键词的识别
    if (ruleBasedResult.confidence < 0.7) {
      const keywordResult = this.keywordBasedRecognition(normalizedText, context);
      if (keywordResult.confidence > ruleBasedResult.confidence) {
        return keywordResult;
      }
    }
    
    // 4. 实体抽取
    ruleBasedResult.entities = await this.extractEntities(
      normalizedText, 
      ruleBasedResult.intent,
      context
    );
    
    return ruleBasedResult;
  }
  
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[,.!?!,.]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private ruleBasedRecognition(
    text: string, 
    context: DialogContext
  ): IntentRecognitionResult {
    // 根据当前对话步骤，使用不同的正则模式匹配
    const currentStep = context.currentStep;
    const patterns = this.intentPatterns.get(currentStep);
    
    // ... 实现细节
  }
  
  private async extractEntities(
    text: string, 
    intent: VoiceOrderIntent,
    context: DialogContext
  ): Promise<Record<string, any>> {
    // 根据意图类型抽取不同的实体
    switch (intent) {
      case VoiceOrderIntent.PROVIDE_ITEM_TYPE:
        return this.extractItemType(text);
      case VoiceOrderIntent.PROVIDE_QUANTITY:
        return this.extractQuantity(text);
      case VoiceOrderIntent.PROVIDE_ADDRESS:
        return this.extractAddress(text);
      case VoiceOrderIntent.PROVIDE_TIME:
        return this.extractTime(text);
      default:
        return {};
    }
  }
}
```

#### 2.2.3 实体抽取引擎 (EntityEngine)

```typescript
@Injectable()
export class EntityEngine {
  constructor(
    private readonly addressParser: AddressParser,
    private readonly quantityParser: QuantityParser,
    private readonly prisma: PrismaService,
  ) {}
  
  async extractItemType(text: string): Promise<{ categoryId?: number; itemName?: string }> {
    // 1. 从数据库加载所有回收品类
    const categories = await this.prisma.category.findMany({
      where: { isVisible: true, type: 'RECYCLE' },
      select: { id: true, name: true, synonyms: true },
    });
    
    // 2. 在文本中匹配品类名称
    for (const category of categories) {
      const allNames = [category.name, ...(category.synonyms as string[] || [])];
      for (const name of allNames) {
        if (text.includes(name)) {
          return { categoryId: category.id, itemName: name };
        }
      }
    }
    
    // 3. 使用模糊匹配 (编辑距离)
    // ...
    
    return {};
  }
  
  async extractQuantity(text: string): Promise<{ quantity?: number; unit?: string }> {
    return this.quantityParser.parse(text);
  }
  
  async extractAddress(text: string): Promise<AddressData> {
    return this.addressParser.parse(text);
  }
  
  async extractTime(text: string): Promise<{ time?: string; timeType?: 'today' | 'tomorrow' | 'specific' }> {
    // 识别时间表达式
    const patterns = [
      { regex: /今天|今天下午|今天晚上/, type: 'today' },
      { regex: /明天|明天上午 | 明天下午/, type: 'tomorrow' },
      { regex: /(\d{1,2})[月](\d{1,2})[日号]/, type: 'specific' },
      { regex: /(\d{1,2})[点时](\d{1,2})?[分]?/, type: 'specific' },
    ];
    
    // ... 实现细节
  }
  
  async extractPhoneNumber(text: string): Promise<{ phone?: string }> {
    const phonePattern = /1[3-9]\d{9}/g;
    const match = text.match(phonePattern);
    if (match) {
      return { phone: match[0] };
    }
    
    // 识别中文数字表达的手机号
    // ...
    
    return {};
  }
}
```

#### 2.2.4 对话流引擎 (DialogFlowEngine)

```typescript
@Injectable()
export class DialogFlowEngine {
  private readonly flowConfig: DialogFlowConfig;
  
  constructor(
    private readonly intentEngine: IntentEngine,
    private readonly entityEngine: EntityEngine,
    private readonly voiceOrderService: VoiceOrderService,
  ) {
    this.flowConfig = this.loadFlowConfig();
  }
  
  async processInput(
    sessionId: string,
    userId: string,
    recognizedText: string,
  ): Promise<DialogFlowResult> {
    // 1. 获取当前对话状态
    const dialogState = await this.voiceOrderService.getSession(sessionId);
    
    // 2. 意图识别
    const intentResult = await this.intentEngine.recognize(
      recognizedText,
      dialogState.context,
    );
    
    // 3. 根据意图和当前步骤决定下一步动作
    const action = this.determineAction(
      dialogState.currentStep,
      intentResult,
      dialogState.collectedData,
    );
    
    // 4. 执行动作
    const result = await this.executeAction(
      sessionId,
      userId,
      action,
      intentResult,
      dialogState,
    );
    
    // 5. 更新对话状态
    await this.voiceOrderService.updateSession(sessionId, {
      currentStep: result.nextStep,
      collectedData: result.updatedData,
      context: { ...dialogState.context, lastIntent: intentResult.intent },
    });
    
    return result;
  }
  
  private determineAction(
    currentStep: DialogStep,
    intentResult: IntentRecognitionResult,
    collectedData: CollectedData,
  ): DialogAction {
    const intent = intentResult.intent;
    
    // 处理控制类意图
    if (intent === VoiceOrderIntent.SKIP_STEP) {
      return { type: 'SKIP_TO_NEXT_STEP' };
    }
    
    if (intent === VoiceOrderIntent.GO_BACK) {
      return { type: 'GO_TO_PREVIOUS_STEP' };
    }
    
    if (intent === VoiceOrderIntent.SWITCH_TO_MANUAL) {
      return { type: 'SWITCH_TO_MANUAL_MODE' };
    }
    
    // 处理信息提供类意图
    if (intentResult.confidence > 0.7) {
      // 检查是否包含当前步骤需要的信息
      const hasCurrentStepData = this.hasRequiredData(
        currentStep,
        intentResult.entities,
      );
      
      if (hasCurrentStepData) {
        return {
          type: 'COLLECT_DATA_AND_NEXT',
          data: intentResult.entities,
        };
      }
      
      // 检查是否包含后续步骤的信息 (提前提供)
      const futureStepData = this.extractFutureStepData(
        intentResult.entities,
        currentStep,
      );
      
      if (futureStepData.length > 0) {
        return {
          type: 'COLLECT_FUTURE_DATA',
          data: futureStepData,
        };
      }
    }
    
    // 默认：重复当前步骤的提示
    return { type: 'REPEAT_CURRENT_PROMPT' };
  }
}
```

#### 2.2.5 ASR 服务提供者 (ASRProvider)

```typescript
export enum ASRProviderType {
  WECHAT = 'wechat',
  TENCENT_CLOUD = 'tencent_cloud',
  ALI_CLOUD = 'ali_cloud',
}

export interface ASRResult {
  text: string;
  confidence?: number;
  duration?: number;
}

@Injectable()
export class ASRProvider {
  private readonly provider: ASRProviderType;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.provider = this.configService.get<ASRProviderType>(
      'VOICE_ASR_PROVIDER',
      ASRProviderType.WECHAT,
    );
  }
  
  async recognize(audioData: Buffer, options: ASROptions): Promise<ASRResult> {
    switch (this.provider) {
      case ASRProviderType.WECHAT:
        return this.wechatASR(audioData, options);
      case ASRProviderType.TENCENT_CLOUD:
        return this.tencentCloudASR(audioData, options);
      case ASRProviderType.ALI_CLOUD:
        return this.aliCloudASR(audioData, options);
      default:
        throw new Error(`Unknown ASR provider: ${this.provider}`);
    }
  }
  
  private async wechatASR(
    audioData: Buffer,
    options: ASROptions,
  ): Promise<ASRResult> {
    // 调用微信小程序 ASR API
    // 需要小程序 appid 和 secret
    const accessToken = await this.getWechatAccessToken();
    
    const formData = new FormData();
    formData.append('format', options.format || 'mp3');
    formData.append('rate', options.sampleRate?.toString() || '16000');
    formData.append('chunk', audioData);
    formData.append('len', audioData.length.toString());
    
    const response = await firstValueFrom(
      this.httpService.post(
        `https://api.weixin.qq.com/cgi-bin/media/voice/recognize?access_token=${accessToken}`,
        formData,
      ),
    );
    
    return {
      text: response.data.text,
      confidence: 1.0, // 微信 ASR 不返回置信度
    };
  }
  
  private async tencentCloudASR(
    audioData: Buffer,
    options: ASROptions,
  ): Promise<ASRResult> {
    // 调用腾讯云 ASR API
    // 需要腾讯云密钥
    // 支持实时识别和一句话识别
    // ...
  }
}
```

### 2.3 数据库设计

#### 2.3.1 对话状态表 (DialogState)

```prisma
model VoiceOrderSession {
  id              String   @id @default(uuid())
  userId          BigInt   @map("user_id")
  currentStep     String   @map("current_step") // DialogStep 枚举
  collectedData   Json     @map("collected_data")
  context         Json?
  status          String   @default("ACTIVE") // ACTIVE, COMPLETED, ABANDONED
  orderNo         String?  @map("order_no") // 如果创建成功，关联的订单号
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  completedAt     DateTime? @map("completed_at")
  
  user            User     @relation(fields: [userId], references: [id])
  logs            VoiceRecognitionLog[]
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("voice_order_sessions")
}
```

#### 2.3.2 语音识别日志表 (VoiceRecognitionLog)

```prisma
model VoiceRecognitionLog {
  id              String   @id @default(uuid())
  sessionId       String   @map("session_id")
  userId          BigInt   @map("user_id")
  step            String   // 对话步骤
  audioUrl        String?  @map("audio_url")
  audioData       Bytes?   @map("audio_data") // 可选：存储音频二进制
  recognizedText  String   @map("recognized_text")
  intent          String?  // 识别的意图
  entities        Json?
  confidence      Float?
  duration        Int?     // 音频时长 (秒)
  status          String   // SUCCESS, FAILED, TIMEOUT
  errorMessage    String?  @map("error_message")
  createdAt       DateTime @default(now()) @map("created_at")
  
  session         VoiceOrderSession @relation(fields: [sessionId], references: [id])
  
  @@index([sessionId])
  @@index([userId])
  @@index([createdAt])
  @@map("voice_recognition_logs")
}
```

#### 2.3.3 话术模板表 (DialogTemplate)

```prisma
model DialogTemplate {
  id              Int      @id @default(autoincrement())
  step            String   // DialogStep
  templateCode    String   @map("template_code")
  templateText    String   @map("template_text")
  variables       String[] @default([])
  priority        Int      @default(0)
  isActive        Boolean  @default(true) @map("is_active")
  testGroup       String?  @map("test_group") // A/B 测试分组
  hitCount        Int      @default(0) @map("hit_count")
  successRate     Float?   @map("success_rate")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@unique([step, templateCode])
  @@index([step])
  @@index([isActive])
  @@map("dialog_templates")
}
```

### 2.4 API 接口设计

#### 2.4.1 创建对话会话

```typescript
// POST /api/voice-order/session
// Request
{
  userId?: string; // 可选，从 token 中获取
}

// Response 201
{
  success: true;
  data: {
    sessionId: string;
    initialStep: DialogStep.GREETING;
    initialPrompt: string;
  };
}
```

#### 2.4.2 语音识别

```typescript
// POST /api/voice-order/recognize
// Request (multipart/form-data)
{
  audio: File; // 音频文件
  sessionId: string;
  step: DialogStep;
  format?: string; // 音频格式
}

// Response 200
{
  success: true;
  data: {
    recognizedText: string;
    intent: VoiceOrderIntent;
    confidence: number;
    entities: {
      // 抽取的实体
    };
    nextStep: DialogStep;
    nextPrompt: string;
    shouldConfirm?: boolean;
  };
}
```

#### 2.4.3 获取对话状态

```typescript
// GET /api/voice-order/session/:sessionId
// Response 200
{
  success: true;
  data: {
    sessionId: string;
    currentStep: DialogStep;
    collectedData: CollectedData;
    completedFields: FieldName[];
    dialogHistory: DialogMessage[];
  };
}
```

#### 2.4.4 创建订单

```typescript
// POST /api/voice-order/create
// Request
{
  sessionId: string;
  // 其他字段复用 CreateRecycleOrderDto
  source: 'VOICE';
}

// Response 201
{
  success: true;
  data: {
    orderNo: string;
    orderId: string;
    status: OrderStatus;
  };
}
```

## 3. 交互流程设计

### 3.1 完整对话流程

```
用户打开语音下单
    ↓
[前端] 创建会话 → POST /api/voice-order/session
    ↓
[后端] 返回 sessionId 和初始提示
    ↓
[前端] 显示问候语："您好！我是您的回收AI助手，请问您今天想回收什么物品呢？"
    ↓
[用户] 长按语音按钮说话："我要回收旧衣服"
    ↓
[前端] 录音 → 上传音频 → POST /api/voice-order/recognize
    ↓
[后端] ASR 识别 → 意图识别 → 实体抽取
    ↓
[后端] 返回：{ text: "我要回收旧衣服", intent: PROVIDE_ITEM_TYPE, entities: { itemType: "旧衣服" } }
    ↓
[前端] 显示识别结果，更新已收集信息
    ↓
[后端/前端] 生成下一步提示："好的，您要回收【旧衣服】,请问大概有多少公斤呢？"
    ↓
[用户] "大概 5 公斤"
    ↓
... 循环直到所有信息收集完成
    ↓
[前端] 显示信息汇总和确认按钮
    ↓
[用户] 点击确认
    ↓
[前端] POST /api/voice-order/create
    ↓
[后端] 创建订单
    ↓
[前端] 显示订单创建成功
```

### 3.2 智能跳过流程

```
[用户] "我要回收 5 公斤旧衣服，地址是北京市朝阳区 xxx 小区"
    ↓
[后端] 一次性识别出：物品类型 + 数量 + 地址
    ↓
[后端] 自动跳过已提供信息的步骤
    ↓
[前端] 显示："好的！已记录：
         ✓ 物品类型：旧衣服
         ✓ 数量：5 公斤
         ✓ 地址：北京市朝阳区 xxx 小区
         请问您的联系电话是？"
```

### 3.3 错误处理流程

```
[用户] "我要回收旧书" (识别错误，实际是"旧衣服")
    ↓
[后端] 识别出"旧书",但品类库中没有匹配项
    ↓
[后端] 返回低置信度结果 + 建议选项
    ↓
[前端] 显示："抱歉，我没有听清楚。您是想回收：
         [旧衣服] [旧书籍] [旧家电]
         或者您可以重新说一次"
    ↓
[用户] 点击"旧衣服"按钮
    ↓
[前端] 直接提交选择结果
```

## 4. 样式设计

### 4.1 语音按钮样式

```scss
.voice-button {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.recording {
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
  70% { box-shadow: 0 0 0 20px rgba(102, 126, 234, 0); }
  100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
}
```

### 4.2 对话消息样式

```scss
.dialog-message {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  margin: 8px;
  
  &.bot {
    align-self: flex-start;
    background: #f0f0f0;
    border-bottom-left-radius: 4px;
  }
  
  &.user {
    align-self: flex-end;
    background: #667eea;
    color: white;
    border-bottom-right-radius: 4px;
  }
}
```

## 5. 性能优化

### 5.1 音频压缩
- 录音时使用较低采样率 (8kHz 或 16kHz)
- 使用 AMR 或 Opus 等高效音频编码
- 限制最大录音时长 (60 秒)

### 5.2 缓存策略
- 对话状态缓存到 Redis，TTL 30 分钟
- 品类列表等静态数据缓存到客户端
- 识别结果短期缓存，避免重复识别

### 5.3 预加载
- 进入页面时预加载品类列表
- 对话过程中预加载下一步可能用到的数据

## 6. 监控与日志

### 6.1 关键指标
- 语音识别成功率
- 意图识别准确率
- 对话完成率
- 订单创建成功率
- 平均对话轮次

### 6.2 日志记录
- 每次识别请求和结果
- 对话状态变更
- 错误和异常
- 用户行为埋点
