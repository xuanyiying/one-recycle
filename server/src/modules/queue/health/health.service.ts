import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAMES } from '@/common';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.ORDER) private orderQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATION) private notificationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.PAYMENT) private paymentQueue: Queue,
    @InjectQueue(QUEUE_NAMES.DISPATCH) private dispatchQueue: Queue,
  ) {}

  async check(): Promise<any> {
    try {
      const queues = [
        { name: QUEUE_NAMES.ORDER, queue: this.orderQueue },
        { name: QUEUE_NAMES.NOTIFICATION, queue: this.notificationQueue },
        { name: QUEUE_NAMES.PAYMENT, queue: this.paymentQueue },
        { name: QUEUE_NAMES.DISPATCH, queue: this.dispatchQueue },
      ];

      const queueStatus = await Promise.all(
        queues.map(async ({ name, queue }) => {
          try {
            const isPaused = await queue.isPaused();
            const jobCounts = await queue.getJobCounts();
            return {
              name,
              status: 'healthy',
              paused: isPaused,
              counts: jobCounts,
            };
          } catch (error) {
            this.logger.error(`Health check failed for queue ${name}:`, error);
            return {
              name,
              status: 'unhealthy',
              error: (error as Error).message,
            };
          }
        }),
      );

      const allHealthy = queueStatus.every((q) => q.status === 'healthy');

      return {
        status: allHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        queues: queueStatus,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      };
    }
  }
}
