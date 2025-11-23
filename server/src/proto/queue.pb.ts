// Simplified pb types for QueueService
export interface PublishTaskRequest { queue: string; payload: string; priority?: number; delayMs?: number }
export interface PublishTaskResponse { taskId: string }
export interface AckRequest { taskId: string }
export interface AckResponse { success: boolean }
export interface NackRequest { taskId: string; reason?: string }
export interface NackResponse { success: boolean }
export interface ConsumeRequest { queue: string; maxInFlight?: number }
export interface TaskMessage { taskId: string; payload: string; priority?: number }

