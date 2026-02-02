import { Processor, Process, OnQueueActive, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { JdlLogisticsService } from '@/modules/logistics/providers/jd-provider';
import { OrderService } from '@/modules/order/services/order.service';
import { TenantService } from '@/modules/tenant/tenant.service';
import { SettlementService } from '@/modules/tenant/settlement.service';
import { CreateOrderDto as JdlCreateOrderDto } from '@/modules/logistics/dto/jdl.dto';
import { QUEUE_NAMES } from '@/common';

@Processor(QUEUE_NAMES.ORDER)
export class DispatchProcessor {
  private readonly logger = new Logger(DispatchProcessor.name);

  constructor(
    private readonly jdlLogisticsService: JdlLogisticsService,
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
      // 只有已确认的订单才能派单
      if (order.status !== 'CONFIRMED') {
        this.logger.warn(
          `[Dispatch] Order ${orderId} is not in CONFIRMED status (current: ${order.status}), skipping.`,
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

      // 构造京东下单参数
      // 这里的逻辑是：用户（Sender） -> 商家回收中心（Receiver）
      const receiverContact = {
        name: receiptAddress.contactName || 'EcoRecycle Center',
        mobile: receiptAddress.contactPhone || '13800138000',
        address: `${receiptAddress.province}${receiptAddress.city}${receiptAddress.district}${receiptAddress.detail}`,
      };

      const jdlParams: JdlCreateOrderDto = {
        customerCode: 'YOUR_CUSTOMER_CODE', // TODO: Get from config
        orderId: order.orderNo,
        // 发件人：用户
        senderName: order.address.name,
        senderMobile: order.address.mobile,
        senderAddress: `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`,
        // 收件人：回收中心
        receiverName: receiverContact.name,
        receiverMobile: receiverContact.mobile,
        receiverAddress: receiverContact.address,
        weight: order.items.reduce(
          (sum: number, item: any) => sum + (item.estimatedWeight || 0),
          0,
        ),
        goodsName: order.items.map((i: any) => i.categoryId).join(','), // Simplified
        packageCount: 1,
        // promiseTimeType: 1, // Optional
        // payType: 1, // Optional
      };

      this.logger.log(`[Dispatch] Calling JDL CreateOrder for ${orderId}`);

      // 4. 调用京东API
      // 接口调用重试机制由 BullMQ 自动处理 (throw error triggers retry)
      const result = await this.jdlLogisticsService.createOrder(jdlParams);

      if (!result || !result.waybillCode) {
        throw new Error('Failed to get logistics number from JDL');
      }

      this.logger.log(`[Dispatch] JDL Order Created: ${result.waybillCode}`);

      // 5. 更新本地物流信息并更新订单状态 (事务)
      await this.orderService.saveDispatchResult(orderId, {
        logisticsNo: result.waybillCode,
        logisticsCompany: 'JD', // JDL
        status: 'CREATED',
        senderName: jdlParams.senderName,
        senderPhone: jdlParams.senderMobile,
        senderAddress: jdlParams.senderAddress,
        receiverName: jdlParams.receiverName,
        receiverPhone: jdlParams.receiverMobile,
        receiverAddress: jdlParams.receiverAddress,
        estimatedPickupTime: result.estimatedPickupTime
          ? new Date(result.estimatedPickupTime)
          : undefined,
        estimatedDeliveryTime: result.estimatedDeliveryTime
          ? new Date(result.estimatedDeliveryTime)
          : undefined,
        providerData: result,
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
        logisticsNo: result.waybillCode,
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
