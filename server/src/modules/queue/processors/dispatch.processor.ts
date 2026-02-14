import { Processor, Process, OnQueueActive, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { LogisticsIntegrationService } from '@/modules/logistics/logistics-integration.service';
import { OrderService } from '@/modules/order/services/order.service';
import { TenantService } from '@/modules/tenant/tenant.service';
import { SettlementService } from '@/modules/tenant/settlement.service';
import { QUEUE_NAMES, OrderStatus } from '@/common';

@Processor(QUEUE_NAMES.ORDER)
export class DispatchProcessor {
  private readonly logger = new Logger(DispatchProcessor.name);

  constructor(
    private readonly logisticsIntegrationService: LogisticsIntegrationService,
    private readonly orderService: OrderService,
    private readonly tenantService: TenantService,
    private readonly settlementService: SettlementService,
  ) {}

  @Process('dispatch-order')
  async handleDispatchOrder(job: Job) {
    const { orderId } = job.data;
    this.logger.log(`[Dispatch] Start processing dispatch order: ${orderId}`);

    try {
      // 1. 获取订单详情 (包含地址和商品信息)
      const order = (await this.orderService.findOne(Number(orderId))) as any;
      if (!order) {
        this.logger.error(`[Dispatch] Order not found: ${orderId}`);
        return;
      }

      // 2. 检查订单状态
      // 只有待接单/待取件状态才能派单
      const allowedStatuses = [OrderStatus.PENDING, OrderStatus.PENDING_PICKUP];
      if (!allowedStatuses.includes(order.status)) {
        this.logger.warn(
          `[Dispatch] Order ${orderId} is not in dispatchable status (current: ${order.status}), skipping.`,
        );
        return;
      }

      // 3. 幂等性检查
      const existingLogistics =
        await this.orderService.findLogisticsOrder(orderId);
      if (existingLogistics) {
        this.logger.log(
          `[Dispatch] Logistics order already exists for ${orderId}`,
        );
        return;
      }

      // 3.1 租户分配与检查
      let tenantId = order.tenantId;
      if (!tenantId) {
        this.logger.log(
          `[Dispatch] Order ${orderId} has no tenant assigned. Auto-assigning...`,
        );
        const tenant = await this.tenantService.assignTenant(Number(orderId));
        tenantId = tenant.id;
      }

      // 获取租户收货地址
      const receiptAddress = await this.tenantService.getReceiptAddress(
        Number(tenantId),
      );

      // 这里的逻辑是：用户（Sender） -> 商家回收中心（Receiver）
      const receiverContact = {
        name: receiptAddress.contactName || 'EcoRecycle Center',
        mobile: receiptAddress.contactPhone || '13800138000',
        address: `${receiptAddress.province}${receiptAddress.city}${receiptAddress.district}${receiptAddress.detail}`,
      };

      this.logger.log(`[Dispatch] Calling logistics integration for ${orderId}`);

      const cargo = order.items.map((item: any) => ({
        name: String(item.categoryId),
        count: Math.max(1, Number(item.quantity || 1)),
      }));

      const result = await this.logisticsIntegrationService.createPickupOrder({
        orderId: BigInt(order.id),
        sender: {
          name: order.address.name,
          phone: order.address.mobile,
          address: `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`,
          province: order.address.province,
          city: order.address.city,
          district: order.address.district,
        },
        receiver: {
          name: receiverContact.name,
          phone: receiverContact.mobile,
          address: receiverContact.address,
          province: receiptAddress.province,
          city: receiptAddress.city,
          district: receiptAddress.district,
        },
        cargo,
      });

      this.logger.log(`[Dispatch] Logistics order created: ${result.logisticsNo}`);

      // 5. 更新本地物流信息并更新订单状态 (事务)
      await this.orderService.saveDispatchResult(orderId, {
        logisticsNo: result.logisticsNo,
        logisticsCompany: result.logisticsCompany,
        status: result.status,
        senderName: order.address.name,
        senderPhone: order.address.mobile,
        senderAddress: `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`,
        receiverName: receiverContact.name,
        receiverPhone: receiverContact.mobile,
        receiverAddress: receiverContact.address,
        providerData: result.providerData,
      });

      // 6. 初始化结算记录
      // 假设有一个预估运费，这里暂时用 0 或固定值，实际应从 JDL 响应获取或配置计算
      const estimatedExpressFee = 10.0;
      await this.settlementService.initSettlement(
        Number(orderId),
        Number(tenantId),
        estimatedExpressFee,
      );

      this.logger.log(
        `[Dispatch] Logistics info saved, settlement initialized, and order status updated for order ${orderId}`,
      );

      return {
        success: true,
        orderId,
        logisticsNo: result.logisticsNo,
      };
    } catch (error) {
      this.logger.error(
        `[Dispatch] Failed to dispatch order ${orderId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error; // Let Bull handle retry
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(
        job.data,
      )}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed with error ${err.message}`,
    );
  }
}
