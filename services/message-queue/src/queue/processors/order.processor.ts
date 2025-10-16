import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../queue.constants';
import {
  OrderCreatedEventDto,
  OrderStatusChangedEventDto,
  OrderCancelledEventDto,
  OrderCompletedEventDto,
} from '../dto/order-events.dto';
import { NotificationQueueService } from '../services/notification-queue.service';
import { OrderServiceClient } from '../../clients/order-service.client';
import { InventoryServiceClient } from '../../clients/inventory-service.client';
import { DispatchServiceClient } from '../../clients/dispatch-service.client';
import { PaymentServiceClient } from '../../clients/payment-service.client';

@Processor(QUEUE_NAMES.ORDER)
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    private readonly notificationQueueService: NotificationQueueService,
    private readonly orderServiceClient: OrderServiceClient,
    private readonly inventoryServiceClient: InventoryServiceClient,
    private readonly dispatchServiceClient: DispatchServiceClient,
    private readonly paymentServiceClient: PaymentServiceClient,
  ) { }

  /**
   * 处理订单创建事件
   */
  @Process({ name: 'order-created', concurrency: 5 })
  async handleOrderCreated(job: Job<OrderCreatedEventDto>): Promise<any> {
    const { orderId, userId, items, address, scheduledTime } = job.data;

    this.logger.log(`Processing order created: ${orderId}`);

    try {
      // 1. 检查库存是否充足
      this.logger.log(`Checking inventory for order: ${orderId}`);
      const inventoryCheck = await this.inventoryServiceClient.checkInventory({
        items: items.map(item => ({
          categoryId: item.categoryId,
          quantity: item.quantity,
        })),
      });

      if (!inventoryCheck.available) {
        this.logger.warn(`Insufficient inventory for order: ${orderId}`);
        await this.orderServiceClient.updateOrderStatus(orderId, 'INVENTORY_INSUFFICIENT');
        throw new Error('Insufficient inventory');
      }

      // 2. 锁定库存
      this.logger.log(`Locking inventory for order: ${orderId}`);
      await this.inventoryServiceClient.lockInventory({
        orderId,
        items: items.map(item => ({
          categoryId: item.categoryId,
          quantity: item.quantity,
        })),
      });

      // 3. 计算订单总价
      this.logger.log(`Calculating price for order: ${orderId}`);
      const totalAmount = items.reduce(
        (sum, item) => sum + item.estimatedPrice * item.quantity,
        0,
      );

      // 4. 更新订单总价
      await this.orderServiceClient.updateOrderAmount(orderId, totalAmount);

      // 5. 更新订单状态为已确认
      await this.orderServiceClient.updateOrderStatus(orderId, 'CONFIRMED');

      // 6. 发送订单确认通知
      this.logger.log(`Sending order confirmation notification for: ${orderId}`);
      await this.notificationQueueService.sendOrderStatusNotification(
        userId,
        orderId,
        '已创建',
      );

      this.logger.log(`Order created successfully: ${orderId}, Total: ${totalAmount}`);

      return {
        success: true,
        orderId,
        totalAmount,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to process order created: ${orderId}`, error.stack);

      // 释放已锁定的库存
      try {
        await this.inventoryServiceClient.releaseInventory(orderId);
      } catch (releaseError) {
        this.logger.error(`Failed to release inventory for order ${orderId}`, releaseError);
      }

      throw error;
    }
  }

  /**
   * 处理订单状态变更事件
   */
  @Process({ name: 'order-status-changed', concurrency: 5 })
  async handleOrderStatusChanged(job: Job<OrderStatusChangedEventDto>): Promise<any> {
    const { orderId, oldStatus, newStatus, updatedBy, reason } = job.data;

    this.logger.log(`Processing order status change: ${orderId} (${oldStatus} -> ${newStatus})`);

    try {
      // 1. 更新订单状态（实际应调用order-service）
      this.logger.log(`Updating order status in database: ${orderId}`);

      // 2. 根据新状态触发不同的业务逻辑
      switch (newStatus) {
        case 'CONFIRMED':
          this.logger.log(`Order confirmed: ${orderId}`);
          // 触发派单流程
          break;
        case 'PICKED_UP':
          this.logger.log(`Order picked up: ${orderId}`);
          // 通知用户物品已取走
          break;
        case 'COMPLETED':
          this.logger.log(`Order completed: ${orderId}`);
          // 触发支付流程
          break;
        case 'CANCELLED':
          this.logger.log(`Order cancelled: ${orderId}`);
          // 处理取消逻辑
          break;
      }

      // 3. 发送状态变更通知
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
      this.logger.error(`Failed to process order status change: ${orderId}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理订单完成事件（积分入账）
   */
  @Process({ name: 'order-completed', concurrency: 5 })
  async handleOrderCompleted(job: Job<OrderCompletedEventDto>): Promise<any> {
    const { orderId, userId, settlementAmount, completedAt } = job.data;

    this.logger.log(`Processing order completed: ${orderId}, User: ${userId}, Amount: ${settlementAmount}`);

    try {
      // 1. 调用payment-service增加用户余额
      this.logger.log(`Calling payment service to increase balance for user ${userId}`);
      const transaction = await this.paymentServiceClient.increaseBalance({
        userId,
        amount: settlementAmount,
        orderId,
        description: `订单收入 - ${orderId}`,
      });

      this.logger.log(
        `Balance increased successfully for user ${userId}. ` +
        `Transaction ID: ${transaction.id}, ` +
        `Balance before: ${transaction.balanceBefore}, ` +
        `Balance after: ${transaction.balanceAfter}`
      );

      // 2. 发送积分入账通知
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
        `New balance: ${transaction.balanceAfter}`
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
        error.stack
      );

      // 如果是幂等性错误（订单已入账），不抛出异常
      if (error.response?.data?.message?.includes('already credited') ||
        error.response?.data?.message?.includes('已入账')) {
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
  async handleOrderCancelled(job: Job<OrderCancelledEventDto>): Promise<any> {
    const { orderId, userId, reason, cancelledBy } = job.data;

    this.logger.log(`Processing order cancellation: ${orderId}, Reason: ${reason}`);

    try {
      // 1. 获取订单详情
      const order = await this.orderServiceClient.getOrder(orderId);

      // 2. 释放已锁定的库存
      this.logger.log(`Releasing inventory for order: ${orderId}`);
      try {
        await this.inventoryServiceClient.releaseInventory(orderId);
      } catch (inventoryError) {
        this.logger.error(`Failed to release inventory: ${orderId}`, inventoryError);
      }

      // 3. 如果已派单，取消京东快递订单
      if (order.waybillNo) {
        this.logger.log(`Cancelling dispatch for order: ${orderId}`);
        try {
          await this.dispatchServiceClient.cancelDispatch(orderId, reason);
        } catch (dispatchError) {
          this.logger.error(`Failed to cancel dispatch: ${orderId}`, dispatchError);
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
          amount: (order as any).settlementAmount || order.totalAmount,
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
        if (refundError.response?.data?.message?.includes('has not been credited')) {
          this.logger.log(`Order ${orderId} has not been credited, no refund needed`);
        } else if (refundError.response?.data?.message?.includes('already refunded')) {
          this.logger.log(`Order ${orderId} already refunded, skipping`);
          refundInitiated = true;
        } else {
          this.logger.error(`Failed to process refund for order ${orderId}`, refundError);
        }
      }

      // 5. 更新订单状态为已取消
      await this.orderServiceClient.updateOrderStatus(orderId, 'CANCELLED', {
        cancelReason: reason,
        cancelledBy,
      });

      // 6. 通知用户订单已取消
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
      this.logger.error(`Failed to process order cancellation: ${orderId}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理派单任务（调用京东快递API）
   */
  @Process({ name: 'dispatch-order', concurrency: 3 })
  async handleDispatchOrder(job: Job<{ orderId: string }>): Promise<any> {
    const { orderId } = job.data;

    this.logger.log(`Processing dispatch for order: ${orderId}`);

    try {
      // 1. 获取订单详情
      this.logger.log(`Fetching order details: ${orderId}`);
      const order = await this.orderServiceClient.getOrder(orderId);

      // 2. 检查订单状态是否允许派单
      if (order.status !== 'CONFIRMED' && order.status !== 'PAID') {
        this.logger.warn(`Order ${orderId} status ${order.status} not ready for dispatch`);
        return {
          success: false,
          orderId,
          reason: 'Order not ready for dispatch',
        };
      }

      // 3. 调用派单服务（会调用京东快递API）
      this.logger.log(`Calling dispatch service for order: ${orderId}`);
      const dispatchResult = await this.dispatchServiceClient.autoDispatch({
        orderId: order.id,
        address: {
          province: order.address.province || '',
          city: order.address.city || '',
          district: order.address.district || '',
          detail: order.address.detail || order.address.fullAddress,
          contactName: order.address.contactName || '',
          contactPhone: order.address.contactPhone || '',
          coordinates: order.address.coordinates,
        },
        items: order.items.map(item => ({
          categoryId: item.categoryId,
          quantity: item.quantity,
        })),
        scheduledTime: order.scheduledTime,
        serviceType: 'STANDARD',
      });

      if (!dispatchResult.success) {
        throw new Error('Dispatch failed');
      }

      // 4. 更新订单信息（快递员和运单号）
      this.logger.log(`Updating order with dispatch info: ${orderId}`);
      await this.orderServiceClient.assignCourier(
        orderId,
        dispatchResult.courierId || '',
        dispatchResult.waybillNo,
      );

      // 5. 更新订单状态为已派单
      await this.orderServiceClient.updateOrderStatus(orderId, 'DISPATCHED', {
        waybillNo: dispatchResult.waybillNo,
        jdOrderNo: dispatchResult.jdOrderNo,
      });

      // 6. 发送派单成功通知
      this.logger.log(`Sending dispatch notification for order: ${orderId}`);
      await this.notificationQueueService.sendOrderStatusNotification(
        order.userId,
        orderId,
        '已派单',
      );

      this.logger.log(
        `Order ${orderId} dispatched successfully. Waybill: ${dispatchResult.waybillNo}`,
      );

      return {
        success: true,
        orderId,
        courierId: dispatchResult.courierId,
        waybillNo: dispatchResult.waybillNo,
        dispatchedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to dispatch order: ${orderId}`, error.stack);

      // 更新订单状态为派单失败
      try {
        await this.orderServiceClient.updateOrderStatus(orderId, 'DISPATCH_FAILED');
      } catch (updateError) {
        this.logger.error(`Failed to update order status: ${orderId}`, updateError);
      }

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
    this.logger.log(`Job ${job.id} completed successfully. Result: ${JSON.stringify(result)}`);
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