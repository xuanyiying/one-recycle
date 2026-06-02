import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from '@/modules/account/account.service';
import { PaymentService } from '@/modules/payment/payment.service';
import { toNumber } from '@/common/utils/decimal.util';
import {
  IPaymentService,
  IncreaseBalanceRequest,
  IncreaseBalanceResponse,
  RefundBalanceRequest,
  RefundBalanceResponse,
  InitiateRefundRequest,
  InitiateRefundResponse,
  CreatePaymentLogParam,
} from '../interfaces/payment-service.interface';

@Injectable()
export class LocalPaymentServiceAdapter implements IPaymentService {
  private readonly logger = new Logger(LocalPaymentServiceAdapter.name);

  constructor(
    private readonly accountService: AccountService,
    private readonly paymentService: PaymentService,
  ) {}

  async increaseBalance(
    request: IncreaseBalanceRequest,
  ): Promise<IncreaseBalanceResponse> {
    this.logger.log(
      `Increasing balance for user ${request.userId}, amount: ${request.amount}`,
    );

    const userId = BigInt(request.userId);
    const account = await this.accountService.deposit(
      userId,
      request.amount,
      request.orderId,
      request.description || `订单收入 - ${request.orderId}`,
    );

    const transaction = await this.findLatestTransaction(account.id);

    return {
      id: transaction?.id?.toString() || '',
      accountId: account.id.toString(),
      type: 'ORDER_INCOME',
      amount: request.amount,
      balanceBefore: transaction
        ? toNumber(transaction.balanceBefore)
        : toNumber(account.availableBalance) - request.amount,
      balanceAfter: toNumber(account.availableBalance),
      orderId: request.orderId,
      description: request.description || `订单收入 - ${request.orderId}`,
      createdAt:
        transaction?.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  async refundBalance(
    request: RefundBalanceRequest,
  ): Promise<RefundBalanceResponse> {
    this.logger.log(
      `Refunding balance for user ${request.userId}, amount: ${request.amount}`,
    );

    const userId = BigInt(request.userId);

    const account = await this.accountService.deposit(
      userId,
      -request.amount,
      request.orderId,
      request.description || `订单取消退款 - ${request.orderId}`,
    );

    const transaction = await this.findLatestTransaction(account.id);

    return {
      id: transaction?.id?.toString() || '',
      accountId: account.id.toString(),
      type: 'ORDER_REFUND',
      amount: request.amount,
      balanceBefore: transaction
        ? toNumber(transaction.balanceBefore)
        : toNumber(account.availableBalance) + request.amount,
      balanceAfter: toNumber(account.availableBalance),
      orderId: request.orderId,
      description: request.description || `订单取消退款 - ${request.orderId}`,
      createdAt:
        transaction?.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  async initiateRefund(
    request: InitiateRefundRequest,
  ): Promise<InitiateRefundResponse> {
    this.logger.log(
      `Initiating refund for order ${request.orderId}, transaction ${request.transactionId}`,
    );

    // In monolithic mode, refund is handled via refundBalance
    // This method is primarily for microservices mode
    return {
      success: true,
      refundId: `refund-${request.transactionId}`,
      amount: request.amount,
      status: 'SUCCESS',
    };
  }

  async createPaymentLog(param: CreatePaymentLogParam): Promise<void> {
    this.logger.log(
      `Creating payment log for transaction ${param.transactionId}, status: ${param.status}`,
    );

    // In monolithic mode, payment logs are handled by the Payment module directly
    // This is a no-op in local adapter as the payment service creates logs internally
  }

  async isTransactionProcessed(transactionId: string): Promise<boolean> {
    this.logger.debug(
      `Checking if transaction ${transactionId} is already processed`,
    );

    try {
      const payment = await this.paymentService.isTransactionProcessed(
        BigInt(transactionId),
      );
      return !!payment;
    } catch (error) {
      this.logger.error(
        `Failed to check idempotency for transaction ${transactionId}:`,
        error,
      );
      return false; // Fallback to false to allow processing if check fails
    }
  }

  private async findLatestTransaction(accountId: bigint) {
    const { prisma } = this.accountService as any;
    if (!prisma) return null;

    try {
      return await prisma.transaction.findFirst({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      return null;
    }
  }
}
