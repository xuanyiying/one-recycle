import { get, post, put, del } from '@/utils/request'

// ============================================================================
// 类型定义
// ============================================================================

export interface CreateSessionResponse {
  success: boolean
  data: {
    sessionId: string
    initialStep: string
    initialPrompt: string
  }
}

export interface RecognizeResponse {
  success: boolean
  data: {
    recognizedText: string
    intent: string
    entities: any
    nextStep: string
    nextPrompt: string
    shouldConfirm?: boolean
  }
}

export interface CreateOrderResponse {
  success: boolean
  data: {
    orderNo: string
    orderId: string
    status: string
  }
}

// ============================================================================
// API 服务
// ============================================================================

/**
 * 创建语音下单会话
 */
export async function createVoiceSession(): Promise<CreateSessionResponse> {
  return post<CreateSessionResponse>('/voice-order/session', {})
}

/**
 * 获取会话状态
 */
export async function getVoiceSession(sessionId: string) {
  return get(`/voice-order/session/${sessionId}`)
}

/**
 * 更新会话状态
 */
export async function updateVoiceSession(
  sessionId: string,
  data: {
    nextStep: string
    collectedData?: any
  }
) {
  return put(`/voice-order/session/${sessionId}`, data)
}

/**
 * 结束会话
 */
export async function endVoiceSession(sessionId: string) {
  return del(`/voice-order/session/${sessionId}`)
}

/**
 * 语音识别
 */
export async function recognizeVoice(
  sessionId: string,
  audioFile: File | string,
  options?: {
    audioFormat?: string
    duration?: number
    recognizedText?: string
  }
): Promise<RecognizeResponse> {
  // 如果是文件，使用 uploadFile
  if (typeof audioFile !== 'string') {
    // TODO: 实现文件上传识别
    throw new Error('文件上传识别暂未实现')
  }

  // 如果是文本，直接调用识别接口
  return post<RecognizeResponse>('/voice-order/recognize', {
    sessionId,
    recognizedText: options?.recognizedText,
    audioFormat: options?.audioFormat,
    duration: options?.duration,
  })
}

/**
 * 创建订单
 */
export async function createVoiceOrder(data: {
  sessionId: string
  source: 'VOICE'
  [key: string]: any
}): Promise<CreateOrderResponse> {
  return post<CreateOrderResponse>('/voice-order/create', data)
}
