import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LogisticsApiAction, LogisticsStatus } from '@prisma/client';
import { LogisticsProviderFactory } from './providers/logistics-provider.factory';
import { PrecheckDto, CreateOrderDto, SubscribeTraceDto } from './dto/jdl.dto';

@Injectable()
export class LogisticsIntegrationService {
  private readonly logger = new Logger(LogisticsIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: LogisticsProviderFactory,
  ) {}

  private async upsertCallLog(params: {
    idempotencyKey: string;
    orderId: bigint;
    logisticsOrderId?: bigint;
    providerCode: string;
    action: LogisticsApiAction;
    requestPayload?: any;
    responsePayload?: any;
    httpStatus?: number;
    durationMs?: number;
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
    retryCount?: number;
  }) {
    const {
      idempotencyKey,
      orderId,
      logisticsOrderId,
      providerCode,
      action,
      requestPayload,
      responsePayload,
      httpStatus,
      durationMs,
      success,
      errorCode,
      errorMessage,
      retryCount,
    } = params;

    await this.prisma.logisticsApiCall.upsert({
      where: { idempotencyKey },
      create: {
        idempotencyKey,
        orderId,
        logisticsOrderId,
        providerCode,
        action,
        requestPayload,
        responsePayload,
        httpStatus,
        durationMs,
        success,
        errorCode,
        errorMessage,
        retryCount: retryCount ?? 0,
      },
      update: {
        logisticsOrderId,
        requestPayload,
        responsePayload,
        httpStatus,
        durationMs,
        success,
        errorCode,
        errorMessage,
        retryCount: retryCount !== undefined ? retryCount : { increment: 1 },
      },
    });
  }

  private async callWithRetry<T>(params: {
    orderId: bigint;
    logisticsOrderId?: bigint;
    providerCode: string;
    action: LogisticsApiAction;
    requestPayload?: any;
    handler: () => Promise<T>;
  }): Promise<T> {
    const {
      orderId,
      logisticsOrderId,
      providerCode,
      action,
      requestPayload,
      handler,
    } = params;
    const idempotencyKey = `${providerCode}:${action}:${orderId.toString()}`;

    let lastError: any;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const startedAt = Date.now();
      try {
        const result = await handler();
        const durationMs = Date.now() - startedAt;
        await this.upsertCallLog({
          idempotencyKey,
          orderId,
          logisticsOrderId,
          providerCode,
          action,
          requestPayload,
          responsePayload: result as any,
          durationMs,
          success: true,
          retryCount: attempt,
        });
        return result;
      } catch (error: any) {
        lastError = error;
        const durationMs = Date.now() - startedAt;
        await this.upsertCallLog({
          idempotencyKey,
          orderId,
          logisticsOrderId,
          providerCode,
          action,
          requestPayload,
          responsePayload: error?.response?.data ?? undefined,
          httpStatus: error?.response?.status ?? undefined,
          durationMs,
          success: false,
          errorCode: error?.code ? String(error.code) : undefined,
          errorMessage: error?.message ? String(error.message) : undefined,
          retryCount: attempt,
        });
        if (attempt < 2) {
          await new Promise((resolve) =>
            setTimeout(resolve, 200 * (attempt + 1)),
          );
        }
      }
    }

    throw lastError;
  }

  async createPickupOrder(params: {
    orderId: bigint;
    providerCode?: string;
    sender: {
      name: string;
      phone: string;
      address: string;
      province: string;
      city: string;
      district: string;
    };
    receiver: {
      name: string;
      phone: string;
      address: string;
      province: string;
      city: string;
      district: string;
    };
    cargo: Array<{ name: string; count: number }>;
  }): Promise<{
    logisticsNo: string;
    logisticsCompany: string;
    status: LogisticsStatus;
    providerData?: any;
  }> {
    this.logger.log(`Creating pickup order for orderId: ${params.orderId}`);

    // 动态创建 provider 实例并获取配置（类似 Java 工厂模式）
    const { provider, config } = params.providerCode
      ? await this.providerFactory.getProviderWithConfig(params.providerCode)
      : await this.providerFactory.getActiveProviderWithConfig();

    const providerCode = provider.code;
    const customerCode = config.appId;

    if (!customerCode) {
      throw new BadRequestException(
        `Customer code (appId) is not configured for provider '${providerCode}'. ` +
          `Please configure it in the database.`,
      );
    }

    this.logger.debug(
      `Using provider: ${providerCode}, customerCode: ${customerCode}`,
    );

    await this.callWithRetry({
      orderId: params.orderId,
      providerCode,
      action: LogisticsApiAction.PRECHECK,
      requestPayload: params,
      handler: async () =>
        provider.precheck({
          customerCode,
          pickupAddress: params.sender.address,
          pickupProvince: params.sender.province,
          pickupCity: params.sender.city,
          pickupCounty: params.sender.district,
          deliveryAddress: params.receiver.address,
        } as PrecheckDto),
    });

    const orderRes = await this.callWithRetry({
      orderId: params.orderId,
      providerCode,
      action: LogisticsApiAction.CREATE_ORDER,
      requestPayload: params,
      handler: async () =>
        provider.createOrder({
          customerCode,
          orderId: params.orderId.toString(),
          senderName: params.sender.name,
          senderMobile: params.sender.phone,
          senderAddress: params.sender.address,
          receiverName: params.receiver.name,
          receiverMobile: params.receiver.phone,
          receiverAddress: params.receiver.address,
          packageCount: 1,
          weight: 1,
          goodsName: params.cargo.map((c) => c.name).join(','),
        } as CreateOrderDto),
    });

    const waybillCode =
      (orderRes as any)?.data?.waybillCode || (orderRes as any)?.waybillCode;

    if (!waybillCode) {
      throw new Error('Logistics createOrder returned no waybillCode');
    }

    await this.callWithRetry({
      orderId: params.orderId,
      providerCode,
      action: LogisticsApiAction.SUBSCRIBE_TRACE,
      requestPayload: { waybillCode },
      handler: async () =>
        provider.subscribeTrace({
          customerCode,
          waybillCode,
        } as SubscribeTraceDto),
    });

    this.logger.log(`Successfully created pickup order: ${waybillCode}`);

    return {
      logisticsNo: String(waybillCode),
      logisticsCompany: providerCode,
      status: LogisticsStatus.ORDERED,
      providerData: orderRes,
    };
  }
}
