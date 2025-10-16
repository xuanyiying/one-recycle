import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

export class WithdrawalNotFoundException extends NotFoundException {
  constructor(withdrawalId: string) {
    super(`提现记录 ${withdrawalId} 不存在`);
  }
}

export class WithdrawalAlreadyProcessedException extends ConflictException {
  constructor(withdrawalId: string) {
    super(`提现记录 ${withdrawalId} 已经被处理`);
  }
}

export class MinimumWithdrawalAmountException extends BadRequestException {
  constructor(minimum: number) {
    super(`最低提现金额为 ${minimum} 元`);
  }
}

export class DuplicateWithdrawalException extends ConflictException {
  constructor(outTradeNo: string) {
    super(`提现订单号 ${outTradeNo} 已存在`);
  }
}

export class PaymentProviderException extends BadRequestException {
  constructor(provider: string, message: string) {
    super(`支付提供商 ${provider} 错误: ${message}`);
  }
}

export class PaymentCallbackVerificationException extends BadRequestException {
  constructor() {
    super('支付回调验证失败');
  }
}
