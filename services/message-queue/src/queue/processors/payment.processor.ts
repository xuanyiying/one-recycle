import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../queue.module';
import {
  PaymentCallbackEventDto,
  PaymentSuccessEventDto,
  PaymentFailedEventDto,
  RefundEventDto,
  WithdrawalCreatedEventDto,
  WithdrawalCompletedEventDto,
} from '../dto/payment-events.dto';
import { NotificationQueueService } from '../services/notification-queue.service';
import { OrderServiceClient } from '../../clients/order-service.client';
import { PaymentServiceClient } from '../../clients/payment-service.client';
import { PaymentLogRepository } from '../../database/repositories/payment-log.repository';

@Processor(QUEUE_NAMES.PAYMENT)
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private readonly notificationQueueService: NotificationQueueService,
    private readonly orderServiceClient: OrderServiceClient,
    private readonly paymentServiceClient: PaymentServiceClient,
    private readonly paymentLogRepository: PaymentLogRepository,
  ) { }

  /**
   * 处理支付回调
   */
  @Process({ name: 'process-payment-callback', concurrency: 5 })
  async handlePaymentCallback(job: Job<PaymentCallbackEventDto>): Promise<any> {
    const { transactionId, orderId, amount, status, provider, rawData } = job.data;

    this.logger.log(
      `Processing payment callback: Transaction ${transactionId}, Order ${orderId}, Status: ${status}`,
    );

    try {
      // 1. 幂等性检查 - 使用数据库
      const isProcessed = await this.paymentLogRepository.isTransactionProcessed(transactionId);
      if (isProcessed) {
        this.logger.warn(`Transaction ${transactionId} already processed, skipping`);
        return {
          success: true,
          duplicate: true,
          transactionId,
        };
      }

      // 2. 获取订单信息
      this.logger.log(`Fetching order details for: ${orderId}`);
      const order = await this.orderServiceClient.getOrder(orderId);

      // 3. 验证金额
      this.logger.log(`Verifying payment amount for order: ${orderId}`);
      if (Math.abs(amount - order.totalAmount) > 0.01) {
        throw new Error(
          `Amount mismatch for order ${orderId}: expected ${order.totalAmount}, got ${amount}`,
        );
      }

      // 4. 根据支付状态触发后续流程
      if (status === 'success') {
        this.logger.log(`Payment successful for order: ${orderId}`);

        // 更新订单状态为已支付
        await this.orderServiceClient.updateOrderStatus(orderId, 'PAID', {
          transactionId,
          paidAt: new Date().toISOString(),
        });

        // 发送支付成功通知
        await this.notificationQueueService.sendOrderStatusNotification(
          order.userId,
          orderId,
          '支付成功',
        );
      } else {
        this.logger.warn(`Payment failed for order: ${orderId}`);

        // 更新订单状态为支付失败
        await this.orderServiceClient.updateOrderStatus(orderId, 'PAYMENT_FAILED', {
          transactionId,
          failReason: rawData?.message || 'Payment failed',
        });

        // 发送支付失败通知
        await this.notificationQueueService.sendOrderStatusNotification(
          order.userId,
          orderId,
          '支付失败',
        );
      }

      // 5. 记录支付日志到数据库
      await this.paymentLogRepository.createPaymentLog({
        orderId,
        transactionId,
        status,
        amount,
        provider,
      });

      this.logger.log(
        `Payment callback processed successfully: ${transactionId}, Order: ${orderId}`,
      );

      return {
        success: true,
        transactionId,
        orderId,
        status,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process payment callback: ${transactionId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 处理支付成功事件
   */
  @Process({ name: 'payment-success', concurrency: 5 })
  async handlePaymentSuccess(job: Job<PaymentSuccessEventDto>): Promise<any> {
    const { orderId, transactionId, amount, provider } = job.data;

    this.logger.log(`Processing payment success: Order ${orderId}, Transaction ${transactionId}`);

    try {
      // 1. 获取订单信息
      const order = await this.orderServiceClient.getOrder(orderId);

      // 2. 更新订单状态
      this.logger.log(`Updating order status to PAID: ${orderId}`);
      await this.orderServiceClient.updateOrderStatus(orderId, 'PAID', {
        transactionId,
        paidAt: new Date().toISOString(),
      });

      // 3. 记录支付成功日志
      this.logger.log(`Recording payment success: ${transactionId}`);
      await this.paymentLogRepository.createPaymentLog({
        orderId,
        transactionId,
        status: 'success',
        amount,
        provider,
      });

      // 4. 触发后续业务流程（如发货、积分奖励等）
      this.logger.log(`Triggering post-payment workflows for order: ${orderId}`);

      // 5. 发送支付成功通知
      await this.notificationQueueService.sendOrderStatusNotification(
        order.userId,
        orderId,
        '支付成功',
      );

      return {
        success: true,
        orderId,
        transactionId,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to process payment success: ${orderId}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理支付失败事件
   */
  @Process({ name: 'payment-failed', concurrency: 5 })
  async handlePaymentFailed(job: Job<PaymentFailedEventDto>): Promise<any> {
    const { orderId, transactionId, reason, provider } = job.data;

    this.logger.log(
      `Processing payment failure: Order ${orderId}, Transaction ${transactionId}, Reason: ${reason}`,
    );

    try {
      // 1. 获取订单信息
      const order = await this.orderServiceClient.getOrder(orderId);

      // 2. 更新订单状态
      this.logger.log(`Updating order status to PAYMENT_FAILED: ${orderId}`);
      await this.orderServiceClient.updateOrderStatus(orderId, 'PAYMENT_FAILED', {
        transactionId,
        failReason: reason,
      });

      // 3. 记录支付失败日志
      this.logger.log(`Recording payment failure: ${transactionId}`);
      await this.paymentLogRepository.createPaymentLog({
        orderId,
        transactionId,
        status: 'failed',
        amount: 0,
        provider,
        reason,
      });

      // 4. 释放库存（如果已锁定）
      this.logger.log(`Releasing inventory for order: ${orderId}`);
      // 库存释放逻辑应该在order-cancelled事件中处理

      // 5. 发送支付失败通知
      await this.notificationQueueService.sendOrderStatusNotification(
        order.userId,
        orderId,
        '支付失败',
      );

      return {
        success: true,
        orderId,
        transactionId,
        reason,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to process payment failure: ${orderId}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理退款
   */
  @Process({ name: 'refund-process', concurrency: 3 })
  async handleRefund(job: Job<RefundEventDto>): Promise<any> {
    const { orderId, transactionId, amount, reason } = job.data;

    this.logger.log(
      `Processing refund: Order ${orderId}, Transaction ${transactionId}, Amount: ${amount}`,
    );

    try {
      // 1. 获取订单信息
      const order = await this.orderServiceClient.getOrder(orderId);

      // 2. 调用支付服务发起退款
      this.logger.log(`Initiating refund for transaction: ${transactionId}`);
      const refundResult = await this.paymentServiceClient.initiateRefund({
        orderId,
        transactionId,
        amount,
        reason,
        requestedBy: job.data.requestedBy,
      });

      // 3. 更新订单退款状态
      this.logger.log(`Updating refund status for order: ${orderId}`);
      await this.orderServiceClient.updateOrderStatus(orderId, 'REFUNDED', {
        refundId: refundResult.refundId,
        refundAmount: amount,
        refundReason: reason,
      });

      // 4. 记录退款日志
      this.logger.log(`Recording refund: ${refundResult.refundId}`);
      await this.paymentLogRepository.createPaymentLog({
        orderId,
        transactionId: refundResult.refundId,
        status: 'refunded',
        amount,
        provider: 'refund',
        reason,
      });

      // 5. 发送退款成功通知
      await this.notificationQueueService.sendOrderStatusNotification(
        order.userId,
        orderId,
        '退款成功',
      );

      return {
        success: true,
        orderId,
        transactionId,
        refundId: refundResult.refundId,
        amount,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to process refund: ${orderId}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理提现创建事件
   * 转发到notification队列发送通知
   */
  @Process({ name: 'withdrawal-created', concurrency: 5 })
  async handleWithdrawalCreated(job: Job<WithdrawalCreatedEventDto>): Promise<any> {
    const { withdrawalId, userId, amount } = job.data;

    this.logger.log(
      `Processing withdrawal created event: ${withdrawalId}, User: ${userId}, Amount: ${amount}`,
    );

    try {
      // 转发到notification队列发送通知
      await this.notificationQueueService.sendWithdrawalCreatedNotification(job.data);

      this.logger.log(`Withdrawal created event processed successfully: ${withdrawalId}`);

      return {
        success: true,
        withdrawalId,
        userId,
        amount,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process withdrawal created event: ${withdrawalId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 处理提现完成事件
   * 转发到notification队列发送通知
   */
  @Process({ name: 'withdrawal-completed', concurrency: 5 })
  async handleWithdrawalCompleted(job: Job<WithdrawalCompletedEventDto>): Promise<any> {
    const { withdrawalId, userId, status } =
      job.data;

    this.logger.log(
      `Processing withdrawal completed event: ${withdrawalId}, Status: ${status}`,
    );

    try {
      // 转发到notification队列发送通知
      await this.notificationQueueService.sendWithdrawalCompletedNotification(job.data);

      this.logger.log(`Withdrawal completed event processed successfully: ${withdrawalId}`);

      return {
        success: true,
        withdrawalId,
        userId,
        status,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process withdrawal completed event: ${withdrawalId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 任务开始处理时的钩子
   */
  @OnQueueActive()
  onActive(job: Job): void {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  /**
   * 任务完成时的钩子
   */
  @OnQueueCompleted()
  onCompleted(job: Job): void {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  /**
   * 任务失败时的钩子
   */
  @OnQueueFailed()
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }

}