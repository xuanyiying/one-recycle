import { DialogStep, CollectedDataDto } from '../dto/voice-input.dto';

export interface VoiceOrderSession {
  id: string;
  userId: string;
  currentStep: DialogStep;
  collectedData: CollectedDataDto;
  context: DialogContext;
  status: SessionStatus;
  orderNo?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface DialogContext {
  lastIntent?: string;
  lastEntities?: Record<string, any>;
  retryCount?: number;
  skippedSteps?: string[];
  [key: string]: any;
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export interface DialogMessage {
  type: 'bot' | 'user';
  text: string;
  step?: DialogStep;
  timestamp: Date;
}

export interface VoiceRecognitionResult {
  recognizedText: string;
  confidence?: number;
  intent: VoiceOrderIntent;
  entities: Record<string, any>;
  nextStep: DialogStep;
  nextPrompt: string;
  shouldConfirm?: boolean;
}

export enum VoiceOrderIntent {
  // 信息提供类
  PROVIDE_ITEM_TYPE = 'PROVIDE_ITEM_TYPE',
  PROVIDE_QUANTITY = 'PROVIDE_QUANTITY',
  PROVIDE_ADDRESS = 'PROVIDE_ADDRESS',
  PROVIDE_CONTACT = 'PROVIDE_CONTACT',
  PROVIDE_TIME = 'PROVIDE_TIME',

  // 控制类
  SKIP_STEP = 'SKIP_STEP',
  REPEAT_PROMPT = 'REPEAT_PROMPT',
  GO_BACK = 'GO_BACK',
  SWITCH_TO_MANUAL = 'SWITCH_TO_MANUAL',

  // 确认类
  CONFIRM_ORDER = 'CONFIRM_ORDER',
  MODIFY_INFO = 'MODIFY_INFO',
  CANCEL_ORDER = 'CANCEL_ORDER',

  // 其他
  UNKNOWN = 'UNKNOWN',
}

export interface IntentRecognitionResult {
  intent: VoiceOrderIntent;
  confidence: number;
  matchedKeywords?: string[];
  entities?: Record<string, any>;
}

export interface DialogFlowResult {
  nextStep: DialogStep;
  updatedData: CollectedDataDto;
  botResponse: string;
  shouldConfirm?: boolean;
  suggestedActions?: DialogAction[];
}

export interface DialogAction {
  type: string;
  label: string;
  data?: any;
}

export interface ASROptions {
  format?: string;
  sampleRate?: number;
  language?: string;
  duration?: number;
}

export enum ASRProviderType {
  WECHAT = 'WECHAT',
  TENCENT_CLOUD = 'TENCENT_CLOUD',
}

export interface ASRResult {
  text: string;
  confidence?: number;
  duration?: number;
}
