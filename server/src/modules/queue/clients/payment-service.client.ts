import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentServiceClient {
  async increaseBalance(data: any): Promise<any> {
    // 在单体应用中，这将直接调用PaymentService
    console.log(`Increasing balance:`, data);
    return {
      id: 'txn-001',
      balanceBefore: 0,
      balanceAfter: data.amount,
    };
  }

  async refundBalance(data: any): Promise<{ amount: number; balanceAfter: number }> {
    console.log(`Refund balance:`, data);
    return { amount: data.amount, balanceAfter: 0 };
  }
}
