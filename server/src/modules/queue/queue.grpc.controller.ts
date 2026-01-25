import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  PublishTaskRequest,
  PublishTaskResponse,
  AckRequest,
  AckResponse,
  NackRequest,
  NackResponse,
  ConsumeRequest,
  TaskMessage,
} from '../../proto/queue.pb';

@Controller()
export class QueueGrpcController {
  // 简化：使用内存任务队列
  private tasks: Map<string, { payload: string; priority: number }> = new Map();

  @GrpcMethod('QueueService', 'PublishTask')
  publishTask(data: PublishTaskRequest): PublishTaskResponse {
    const id = `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.tasks.set(id, { payload: data.payload, priority: data.priority || 0 });
    return { taskId: id };
  }

  @GrpcMethod('QueueService', 'Ack')
  ack(_data: AckRequest): AckResponse {
    this.tasks.delete(_data.taskId);
    return { success: true };
  }

  @GrpcMethod('QueueService', 'Nack')
  nack(_data: NackRequest): NackResponse {
    // 简化：保留任务并返回失败
    return { success: true };
  }

  @GrpcMethod('QueueService', 'Consume')
  consume(_data: ConsumeRequest): TaskMessage[] {
    const messages: TaskMessage[] = [];
    for (const [taskId, task] of this.tasks) {
      messages.push({ taskId, payload: task.payload, priority: task.priority });
    }
    return messages;
  }
}
