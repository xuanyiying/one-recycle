// Simplified pb types for NotificationService
export interface Recipient { userId?: string; phoneNumber?: string; email?: string }
export interface NotificationContent { title?: string; body?: string }

export interface SendNotificationRequest { type: string; recipient: Recipient; content: NotificationContent }
export interface SendNotificationResponse { id: string; success: boolean }

export interface SendBatchRequest { type: string; notifications: SendNotificationRequest[] }
export interface SendBatchResponse { successCount: number; failedCount: number }

export interface CreateTemplateRequest { name: string; type: string; subject?: string; content: string; variables: string[] }
export interface UpdateTemplateRequest { id: string; name?: string; subject?: string; content?: string; variables?: string[] }
export interface GetTemplateRequest { id: string }
export interface ListTemplatesRequest { type?: string }

export interface TemplateResponse { id: string; name: string; type: string; subject?: string; content: string; variables: string[] }
export interface ListTemplatesResponse { templates: TemplateResponse[] }

export interface CallbackStatusRequest { id: string; status: string; messageId?: string }
export interface CallbackStatusResponse { success: boolean }

