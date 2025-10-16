import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface WithdrawalCreatedEvent {
  withdrawalId: string;
  userId: string;
  amount: number;
  provider: 'WECHAT' | 'ALIPAY';
  outTradeNo: string;
  createdAt: string;
}

interface WithdrawalCompletedEvent {
  withdrawalId: string;
  userId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'REJECTED';
  transactionId?: string;
  rejectedReason?: string;
  completedAt: string;
}

@Injectable()
export class MessageQueueClient {
  private readonly logger = new Logger(MessageQueueClient.name);
  private readonly messageQueueUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.messageQueueUrl =
      this.configService.get<string>('MESSAGE_QUEUE_URL') ||
      'http://localhost:3010';
  }

  /**
   * 发布提现创建事件
   */
  async publishWithdrawalCreated(event: WithdrawalCreatedEvent): Promise<void> {
    try {
      this.logger.log(
        `Publishing withdrawal created event: ${event.withdrawalId}, User: ${event.userId}`,
      );

      const response = await fetch(`${this.messageQueueUrl}/queue/payment/withdrawal-created`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to publish withdrawal created event: ${error}`);
      }

      this.logger.log(`Withdrawal created event published successfully: ${event.withdrawalId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish withdrawal created event: ${event.withdrawalId}`,
        error.stack,
      );
      // Don't throw error to prevent withdrawal creation from failing
      // The notification can be sent manually later if needed
    }
  }

  /**
   * 发布提现完成事件
   */
  async publishWithdrawalCompleted(event: WithdrawalCompletedEvent): Promise<void> {
    try {
      this.logger.log(
        `Publishing withdrawal completed event: ${event.withdrawalId}, Status: ${event.status}`,
      );

      const response = await fetch(`${this.messageQueueUrl}/queue/payment/withdrawal-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to publish withdrawal completed event: ${error}`);
      }

      this.logger.log(`Withdrawal completed event published successfully: ${event.withdrawalId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish withdrawal completed event: ${event.withdrawalId}`,
        error.stack,
      );
      // Don't throw error to prevent withdrawal processing from failing
    }
  }
}
