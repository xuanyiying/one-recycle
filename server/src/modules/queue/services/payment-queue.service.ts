import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { QUEUE_NAMES } from '../queue.constants';
import {
  PaymentCallbackEventDto,
  PaymentSuccessEventDto,
  PaymentFailedEventDto,
  RefundEventDto,
  WithdrawalCreatedEventDto,
  WithdrawalCompletedEventDto,
} from '../dto/payment-events.dto';
import {
  PersistentSnowflakeIdGenerator,
  RedisSnowflakeStateStore,
  RedisService,
} from '@/common';

@Injectable()
export class PaymentQueueService implements OnModuleInit {
  private readonly logger = new Logger(PaymentQueueService.name);
  private readonly idGenerator: PersistentSnowflakeIdGenerator;

  constructor(
    @InjectQueue(QUEUE_NAMES.PAYMENT) private paymentQueue: Queue,
    private readonly redisService: RedisService,
  ) {
    this.idGenerator = new PersistentSnowflakeIdGenerator({
      workerId: 2,
      datacenterId: 1,
      stateStore: new RedisSnowflakeStateStore(this.redisService),
      stateKey: 'snowflake:state:payment-queue',
      metricsKey: 'snowflake:payment-queue',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.idGenerator.initialize();
  }

  /**
   * 处理支付回调
   */
  async handlePaymentCallback(data: PaymentCallbackEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 10,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        // 使用transactionId作为jobId确保幂等性
        jobId: `payment-callback-${data.transactionId}`,
      };

      const job = await this.paymentQueue.add(
        'process-payment-callback',
        data,
        jobOptions,
      );

      this.logger.log(
        `Payment callback queued: ${data.transactionId}, Order: ${data.orderId}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue payment callback: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理支付成功
   */
  async handlePaymentSuccess(data: PaymentSuccessEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 9,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      };

      const job = await this.paymentQueue.add(
        'payment-success',
        data,
        jobOptions,
      );

      this.logger.log(
        `Payment success event queued: ${data.transactionId}, Order: ${data.orderId}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue payment success event: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理支付失败
   */
  async handlePaymentFailed(data: PaymentFailedEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 9,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      };

      const job = await this.paymentQueue.add(
        'payment-failed',
        data,
        jobOptions,
      );

      this.logger.log(
        `Payment failed event queued: ${data.transactionId}, Order: ${data.orderId}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue payment failed event: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理退款
   */
  async handleRefund(data: RefundEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 10,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        // 使用transactionId作为jobId确保幂等性
        jobId: `refund-${data.transactionId}-${this.idGenerator.nextId()}`,
      };

      const job = await this.paymentQueue.add(
        'refund-process',
        data,
        jobOptions,
      );

      this.logger.log(
        `Refund process queued: ${data.transactionId}, Order: ${data.orderId}, Amount: ${data.amount}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue refund process: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 验证支付回调签名（示例方法，实际实现需要根据支付平台）
   */
  verifyPaymentSignature(
    provider: string,
    _data: any,
    _signature: string,
  ): boolean {
    try {
      // TODO: 实现具体的签名验证逻辑
      // 微信支付和支付宝的签名验证方式不同
      this.logger.log(`Verifying payment signature for provider: ${provider}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to verify payment signature: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return false;
    }
  }

  /**
   * 检查支付是否已处理（幂等性检查）
   */
  async isPaymentProcessed(transactionId: string): Promise<boolean> {
    try {
      const jobId = `payment-callback-${transactionId}`;
      const job = await this.paymentQueue.getJob(jobId);

      if (job) {
        const state = await job.getState();
        return state === 'completed';
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Failed to check payment status: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return false;
    }
  }

  /**
   * 获取队列统计信息
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.paymentQueue.getWaiting(),
        this.paymentQueue.getActive(),
        this.paymentQueue.getCompleted(),
        this.paymentQueue.getFailed(),
        this.paymentQueue.getDelayed(),
      ]);

      const isPaused = await this.paymentQueue.isPaused();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        paused: isPaused,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get queue stats: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 暂停队列
   */
  async pause(): Promise<void> {
    try {
      await this.paymentQueue.pause();
      this.logger.log('Payment queue paused');
    } catch (error) {
      this.logger.error(
        `Failed to pause queue: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 恢复队列
   */
  async resume(): Promise<void> {
    try {
      await this.paymentQueue.resume();
      this.logger.log('Payment queue resumed');
    } catch (error) {
      this.logger.error(
        `Failed to resume queue: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理提现创建事件
   */
  async handleWithdrawalCreated(
    data: WithdrawalCreatedEventDto,
  ): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 8,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        // 使用withdrawalId作为jobId确保幂等性
        jobId: `withdrawal-created-${data.withdrawalId}`,
      };

      const job = await this.paymentQueue.add(
        'withdrawal-created',
        data,
        jobOptions,
      );

      this.logger.log(
        `Withdrawal created event queued: ${data.withdrawalId}, User: ${data.userId}, Amount: ${data.amount}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue withdrawal created event: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理提现完成事件
   */
  async handleWithdrawalCompleted(
    data: WithdrawalCompletedEventDto,
  ): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 9,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        // 使用withdrawalId和雪花算法ID作为jobId确保幂等性
        jobId: `withdrawal-completed-${data.withdrawalId}-${this.idGenerator.nextId()}`,
      };

      const job = await this.paymentQueue.add(
        'withdrawal-completed',
        data,
        jobOptions,
      );

      this.logger.log(
        `Withdrawal completed event queued: ${data.withdrawalId}, Status: ${data.status}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue withdrawal completed event: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
