import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LogisticsApiAction, LogisticsStatus } from '@prisma/client';
import { JdlLogisticsService } from './providers/jd-provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LogisticsIntegrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jdlLogisticsService: JdlLogisticsService,
    private readonly configService: ConfigService,
  ) { }

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
    const providerCode = 'JD';
    const customerCode = this.configService.get<string>('JDL_CUSTOMER_CODE');

    if (!customerCode) {
      throw new Error(
        'JDL_CUSTOMER_CODE is not configured. Please set JDL_CUSTOMER_CODE environment variable.',
      );
    }

    await this.callWithRetry({
      orderId: params.orderId,
      providerCode,
      action: LogisticsApiAction.PRECHECK,
      requestPayload: params,
      handler: async () =>
        this.jdlLogisticsService.precheck({
          customerCode,
          pickupAddress: params.sender.address,
          pickupProvince: params.sender.province,
          pickupCity: params.sender.city,
          pickupCounty: params.sender.district,
          deliveryAddress: params.receiver.address,
        }),
    });

    const orderRes = await this.callWithRetry({
      orderId: params.orderId,
      providerCode,
      action: LogisticsApiAction.CREATE_ORDER,
      requestPayload: params,
      handler: async () =>
        this.jdlLogisticsService.createOrder({
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
        }),
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
        this.jdlLogisticsService.subscribeTrace({
          customerCode,
          waybillCode,
        }),
    });

    return {
      logisticsNo: String(waybillCode),
      logisticsCompany: providerCode,
      status: LogisticsStatus.ORDERED,
      providerData: orderRes,
    };
  }
}
