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
  async publishTask(data: PublishTaskRequest): Promise<PublishTaskResponse> {
    const id = `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.tasks.set(id, { payload: data.payload, priority: data.priority || 0 });
    return { taskId: id };
  }

  @GrpcMethod('QueueService', 'Ack')
  async ack(data: AckRequest): Promise<AckResponse> {
    this.tasks.delete(data.taskId);
    return { success: true };
  }

  @GrpcMethod('QueueService', 'Nack')
  async nack(data: NackRequest): Promise<NackResponse> {
    // 简化：保留任务并返回失败
    return { success: true };
  }

  @GrpcMethod('QueueService', 'Consume')
  async consume(data: ConsumeRequest): Promise<TaskMessage[]> {
    const messages: TaskMessage[] = [];
    for (const [taskId, task] of this.tasks) {
      messages.push({ taskId, payload: task.payload, priority: task.priority });
    }
    return messages;
  }
}

