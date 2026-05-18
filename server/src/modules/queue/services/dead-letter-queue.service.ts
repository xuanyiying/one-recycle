import { Injectable, Logger } from '@nestjs/common';

export interface DeadLetterEntry {
  queueName: string;
  jobId: string | number;
  jobName: string;
  data: any;
  error: string;
  attemptsMade: number;
  failedAt: Date;
}

@Injectable()
export class DeadLetterQueueService {
  private readonly logger = new Logger(DeadLetterQueueService.name);
  private readonly failures: DeadLetterEntry[] = [];
  private readonly MAX_STORED_FAILURES = 1000;

  async recordFailure(entry: DeadLetterEntry): Promise<void> {
    this.logger.error(
      `Dead letter: queue=${entry.queueName} job=${entry.jobId} name=${entry.jobName} error=${entry.error} attempts=${entry.attemptsMade}`,
    );

    this.failures.push(entry);
    if (this.failures.length > this.MAX_STORED_FAILURES) {
      this.failures.shift();
    }
  }

  async getFailures(queueName?: string): Promise<DeadLetterEntry[]> {
    if (queueName) {
      return this.failures.filter((f) => f.queueName === queueName);
    }
    return [...this.failures];
  }

  async getFailureCount(queueName?: string): Promise<number> {
    if (queueName) {
      return this.failures.filter((f) => f.queueName === queueName).length;
    }
    return this.failures.length;
  }
}
