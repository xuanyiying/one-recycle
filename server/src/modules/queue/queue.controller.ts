import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrderQueueService } from './services/order-queue.service';
import { PaymentQueueService } from './services/payment-queue.service';
import { OrderCompletedEventDto, OrderCancelledEventDto } from './dto/order-events.dto';
import { WithdrawalCreatedEventDto, WithdrawalCompletedEventDto } from './dto/payment-events.dto';

@Controller('queue')
export class QueueController {
  private readonly logger = new Logger(QueueController.name);

  constructor(
    private readonly orderQueueService: OrderQueueService,
    private readonly paymentQueueService: PaymentQueueService,
  ) {}

  /**
   * Receive order completed event from order-service
   * POST /queue/order/completed
   */
  @Post('order/completed')
  async handleOrderCompleted(@Body() data: OrderCompletedEventDto): Promise<{ success: boolean; message: string }> {
    this.logger.log(
      `Received order completed event: ${data.orderId}, ` +
      `User: ${data.userId}, Amount: ${data.settlementAmount}`
    );
    
    try {
      await this.orderQueueService.handleOrderCompleted(data);
      
      return {
        success: true,
        message: `Order completed event queued successfully: ${data.orderId}`,
      };
    } catch (error) {
      this.logger.error(`Failed to queue order completed event: ${data.orderId}`, error.stack);
      throw error;
    }
  }

  /**
   * Receive order cancelled event from order-service
   * POST /queue/order/cancelled
   */
  @Post('order/cancelled')
  async handleOrderCancelled(@Body() data: OrderCancelledEventDto): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received order cancelled event: ${data.orderId}`);
    
    try {
      await this.orderQueueService.handleOrderCancelled(data);
      
      return {
        success: true,
        message: `Order cancelled event queued successfully: ${data.orderId}`,
      };
    } catch (error) {
      this.logger.error(`Failed to queue order cancelled event: ${data.orderId}`, error.stack);
      throw error;
    }
  }

  /**
   * Receive withdrawal created event from payment-service
   * POST /queue/payment/withdrawal-created
   */
  @Post('payment/withdrawal-created')
  async handleWithdrawalCreated(
    @Body() data: WithdrawalCreatedEventDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(
      `Received withdrawal created event: ${data.withdrawalId}, User: ${data.userId}, Amount: ${data.amount}`,
    );

    try {
      await this.paymentQueueService.handleWithdrawalCreated(data);

      return {
        success: true,
        message: `Withdrawal created event queued successfully: ${data.withdrawalId}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue withdrawal created event: ${data.withdrawalId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Receive withdrawal completed event from payment-service
   * POST /queue/payment/withdrawal-completed
   */
  @Post('payment/withdrawal-completed')
  async handleWithdrawalCompleted(
    @Body() data: WithdrawalCompletedEventDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(
      `Received withdrawal completed event: ${data.withdrawalId}, Status: ${data.status}`,
    );

    try {
      await this.paymentQueueService.handleWithdrawalCompleted(data);

      return {
        success: true,
        message: `Withdrawal completed event queued successfully: ${data.withdrawalId}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue withdrawal completed event: ${data.withdrawalId}`,
        error.stack,
      );
      throw error;
    }
  }
}
