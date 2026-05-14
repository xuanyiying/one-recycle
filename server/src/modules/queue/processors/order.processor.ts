import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES, OrderStatus } from '@/common';
import {
  OrderCreatedEventDto,
  OrderStatusChangedEventDto,
  OrderCanceledEventDto,
  OrderCompletedEventDto,
} from '../dto/order-events.dto';
import { NotificationQueueService } from '../services/notification-queue.service';
import { OrderServiceClient } from '../clients/order-service.client';
import { InventoryServiceClient } from '../clients/inventory-service.client';
import { DispatchServiceClient } from '../clients/dispatch-service.client';
import { PaymentServiceClient } from '../clients/payment-service.client';
import { PricingService } from '@/modules/pricing/pricing.service';
import { ReferralRewardService } from '@/modules/points/services/referral-reward.service';

@Processor(QUEUE_NAMES.ORDER)
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    private readonly notificationQueueService: NotificationQueueService,
    private readonly orderServiceClient: OrderServiceClient,
    private readonly inventoryServiceClient: InventoryServiceClient,
    private readonly dispatchServiceClient: DispatchServiceClient,
    private readonly paymentServiceClient: PaymentServiceClient,
    private readonly pricingService: PricingService,
    private readonly referralRewardService: ReferralRewardService,
  ) {}

  /**
   * @description 回收物品订单不需要检查库存，锁定库存
   * 处理订单创建事件
   */
  @Process({ name: 'order-created', concurrency: 5 })
  async handleOrderCreated(job: Job<OrderCreatedEventDto>): Promise<any> {
    const { orderId, userId, items, orderType } = job.data;

    this.logger.log(
      `Processing order created: ${orderId}, Type: ${orderType || 'RECYCLE'}`,
    );

    try {
      // 默认是 RECYCLE
      const isRecycleOrder = !orderType || orderType === 'RECYCLE';

      if (!isRecycleOrder) {
        // 1. 检查库存是否充足
        this.logger.log(`Checking inventory for order: ${orderId}`);
        const inventoryCheck = await this.inventoryServiceClient.checkInventory(
          {
            items: items.map((item) => ({
              categoryId: item.categoryId,
              quantity: item.quantity,
            })),
          },
        );

        if (!inventoryCheck.available) {
          this.logger.warn(`Insufficient inventory for order: ${orderId}`);
          await this.orderServiceClient.updateOrderStatus(
            orderId,
            OrderStatus.INSPECTION_EXCEPTION,
          );
          throw new Error('Insufficient inventory');
        }

        // 2. 锁定库存
        this.logger.log(`Locking inventory for order: ${orderId}`);
        await this.inventoryServiceClient.lockInventory({
          orderId,
          items: items.map((item) => ({
            categoryId: item.categoryId,
            quantity: item.quantity,
          })),
        });
      } else {
        this.logger.log(
          `Skipping inventory check/lock for recycle order: ${orderId}`,
        );
      }

      // 3. 计算订单总价
      this.logger.log(`Calculating price for order: ${orderId}`);
      let totalAmount = 0;
      try {
        const pricingResult = await this.pricingService.estimatePricing(
          items.map((item) => ({
            categoryId: item.categoryId,
            condition: item.condition,
            weight: item.weight,
            quantity: item.quantity,
          })),
        );
        const totalRange = pricingResult.pricing.totalEstimate;
        totalAmount =
          Math.round(((totalRange.min + totalRange.max) / 2) * 100) / 100;
      } catch (pricingError) {
        this.logger.warn(
          `Pricing service failed for order ${orderId}, fallback to estimatedPrice: ${pricingError as Error}`,
        );
        totalAmount = items.reduce(
          (sum, item) => sum + item.estimatedPrice * item.quantity,
          0,
        );
      }

      // 4. 更新订单总价
      await this.orderServiceClient.updateOrderAmount(orderId, totalAmount);

      // 5. 更新订单状态为待取件
      await this.orderServiceClient.updateOrderStatus(
        orderId,
        OrderStatus.PENDING_PICKUP,
      );

      // 6. 发送订单确认通知
      this.logger.log(
        `Sending order confirmation notification for: ${orderId}`,
      );
      await this.notificationQueueService.sendOrderStatusNotification(
        userId,
        orderId,
        '已创建',
      );

      this.logger.log(
        `Order created successfully: ${orderId}, Total: ${totalAmount}`,
      );

      return {
        success: true,
        orderId,
        totalAmount,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process order created: ${orderId}`,
        (error as Error).stack,
      );

      // 释放已锁定的库存
      try {
        await this.inventoryServiceClient.releaseInventory(orderId);
      } catch (releaseError) {
        this.logger.error(
          `Failed to release inventory for order ${orderId}`,
          releaseError,
        );
      }

      throw error;
    }
  }

  /**
   * 处理订单状态变更事件
   */
  @Process({ name: 'order-status-changed', concurrency: 5 })
  async handleOrderStatusChanged(
    job: Job<OrderStatusChangedEventDto>,
  ): Promise<any> {
    const { orderId, oldStatus, newStatus, updatedBy } = job.data;

    this.logger.log(
      `Processing order status change: ${orderId} (${oldStatus} -> ${newStatus})`,
    );

    try {
      // 1. 更新订单状态（实际应调用order-service）
      this.logger.log(`Updating order status in database: ${orderId}`);

      // 2. 根据新状态触发不同的业务逻辑
      switch (newStatus) {
        case OrderStatus.PENDING_PICKUP:
          this.logger.log(`Order confirmed: ${orderId}`);
          break;
        case OrderStatus.PICKED_UP:
          this.logger.log(`Order picked up: ${orderId}`);
          break;
        case OrderStatus.COMPLETED:
          this.logger.log(`Order completed: ${orderId}`);
          break;
        case OrderStatus.CANCELLED:
          this.logger.log(`Order cancelled: ${orderId}`);
          break;
      }

      // 3. 发送状态变更通知
      this.logger.log(
        `Sending order status notification for: ${orderId} (${newStatus})`,
      );
      await this.notificationQueueService.sendOrderStatusNotification(
        updatedBy,
        orderId,
        newStatus,
      );

      return {
        success: true,
        orderId,
        oldStatus,
        newStatus,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process order status change: ${orderId}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理订单完成事件（积分入账）
   */
  @Process({ name: 'order-completed', concurrency: 5 })
  async handleOrderCompleted(job: Job<OrderCompletedEventDto>): Promise<any> {
    const { orderId, userId, settlementAmount } = job.data;

    this.logger.log(
      `Processing order completed: ${orderId}, User: ${userId}, Amount: ${settlementAmount}`,
    );

    try {
      // 1. 调用payment-service增加用户余额
      this.logger.log(
        `Calling payment service to increase balance for user ${userId}`,
      );
      const transaction = await this.paymentServiceClient.increaseBalance({
        userId,
        amount: settlementAmount,
        orderId,
        description: `订单收入 - ${orderId}`,
      });
      // 扣减商家账户

      this.logger.log(
        `Balance increased successfully for user ${userId}. ` +
          `Transaction ID: ${transaction.id}, ` +
          `Balance before: ${transaction.balanceBefore}, ` +
          `Balance after: ${transaction.balanceAfter}`,
      );

      // 2. 处理推广返佣
      try {
        this.logger.log(`Processing referral reward for order: ${orderId}`);
        await this.referralRewardService.processOrderReward(BigInt(orderId));
        this.logger.log(`Referral reward processed for order: ${orderId}`);
      } catch (referralError) {
        this.logger.error(
          `Failed to process referral reward for order ${orderId}`,
          referralError,
        );
      }

      // 3. 发送积分入账通知
      this.logger.log(`Sending balance update notification to user ${userId}`);
      await this.notificationQueueService.sendOrderStatusNotification(
        userId,
        orderId,
        '已完成',
      );

      // 可以发送专门的积分入账通知
      // await this.notificationQueueService.sendBalanceUpdateNotification(
      //   userId,
      //   settlementAmount,
      //   transaction.balanceAfter,
      // );

      this.logger.log(
        `Order ${orderId} completed successfully. ` +
          `User ${userId} received ${settlementAmount} points. ` +
          `New balance: ${transaction.balanceAfter}`,
      );

      return {
        success: true,
        orderId,
        userId,
        amount: settlementAmount,
        transactionId: transaction.id,
        newBalance: transaction.balanceAfter,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process order completed: ${orderId}. ` +
          `User: ${userId}, Amount: ${settlementAmount}`,
        (error as Error).stack,
      );

      // 如果是幂等性错误（订单已入账），不抛出异常
      if (
        (error as any).response?.data?.message?.includes('already credited') ||
        (error as any).response?.data?.message?.includes('已入账')
      ) {
        this.logger.warn(`Order ${orderId} already credited, skipping...`);
        return {
          success: true,
          orderId,
          userId,
          alreadyCredited: true,
          processedAt: new Date().toISOString(),
        };
      }

      throw error;
    }
  }

  /**
   * 处理订单取消事件
   */
  @Process({ name: 'order-cancelled', concurrency: 5 })
  async handleOrderCancelled(job: Job<OrderCanceledEventDto>): Promise<any> {
    const { orderId, userId, reason } = job.data;

    this.logger.log(
      `Processing order cancellation: ${orderId}, Reason: ${reason}`,
    );

    try {
      // 1. 获取订单详情
      const order = await this.orderServiceClient.getOrder(orderId);

      // 2. 释放已锁定的库存
      this.logger.log(`Releasing inventory for order: ${orderId}`);
      try {
        await this.inventoryServiceClient.releaseInventory(orderId);
      } catch (inventoryError) {
        this.logger.error(
          `Failed to release inventory: ${orderId}`,
          inventoryError,
        );
      }

      // 3. 如果已派单，取消京东快递订单
      if (order.waybillNo) {
        this.logger.log(`Cancelling dispatch for order: ${orderId}`);
        try {
          await this.dispatchServiceClient.cancelDispatch(orderId, reason);
        } catch (dispatchError) {
          this.logger.error(
            `Failed to cancel dispatch: ${orderId}`,
            dispatchError,
          );
        }
      }

      // 4. 如果订单已完成（已入账），触发退款流程
      // 检查是否存在ORDER_INCOME类型的交易记录
      this.logger.log(`Checking if order ${orderId} has been credited`);
      let refundInitiated = false;

      try {
        // 尝试退款（如果订单已入账）
        const refundResult = await this.paymentServiceClient.refundBalance({
          userId: Number(userId),
          amount: order.totalAmount,
          orderId,
          description: `订单取消退款 - ${reason}`,
        });

        this.logger.log(
          `Refund processed successfully for order ${orderId}, ` +
            `Amount: ${refundResult.amount}, ` +
            `New balance: ${refundResult.balanceAfter}`,
        );
        refundInitiated = true;
      } catch (refundError) {
        // 如果订单未入账，退款会失败，这是正常的
        if (
          (refundError as any).response?.data?.message?.includes(
            'has not been credited',
          )
        ) {
          this.logger.log(
            `Order ${orderId} has not been credited, no refund needed`,
          );
        } else if (
          (refundError as any).response?.data?.message?.includes(
            'already refunded',
          )
        ) {
          this.logger.log(`Order ${orderId} already refunded, skipping`);
          refundInitiated = true;
        } else {
          this.logger.error(
            `Failed to process refund for order ${orderId}`,
            refundError,
          );
        }
      }

      // 5. 更新订单状态为已取消
      await this.orderServiceClient.updateOrderStatus(
        orderId,
        OrderStatus.CANCELLED,
      );

      // 6. 通知用户订单已取消
      this.logger.log(
        `Notifying user ${userId} about cancellation: ${orderId}`,
      );
      await this.notificationQueueService.sendOrderStatusNotification(
        userId,
        orderId,
        '已取消',
      );

      // 7. 如果已分配快递员，通知快递员
      if (order.courierId) {
        this.logger.log(`Notifying courier about cancellation: ${orderId}`);
        // 可以通过通知服务发送给快递员
      }

      this.logger.log(`Order ${orderId} cancelled successfully`);

      return {
        success: true,
        orderId,
        reason,
        refundInitiated,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process order cancellation: ${orderId}`,
        (error as Error).stack,
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
  onCompleted(job: Job, result: any): void {
    this.logger.log(
      `Job ${job.id} completed successfully. Result: ${JSON.stringify(result)}`,
    );
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
