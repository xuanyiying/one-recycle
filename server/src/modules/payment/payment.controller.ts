import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
// 修复导入语句
import { PaymentStatus, RefundStatus } from '@prisma/client';
import { Public } from '@/common/decorators/auth.decorator';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Put(':transactionId/status')
  updateStatus(
    @Param('transactionId') transactionId: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentService.updatePaymentStatus(
      BigInt(transactionId),
      status,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(BigInt(id));
  }

  @Get('order/:orderId')
  findByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.findByOrderId(BigInt(orderId));
  }

  @Post(':paymentId/refunds')
  createRefund(
    @Param('paymentId') paymentId: string,
    @Body('refundAmount') refundAmount: number,
    @Body('reason') reason?: string,
  ) {
    return this.paymentService.createRefund(
      BigInt(paymentId),
      refundAmount,
      reason,
    );
  }

  @Public()
  @Post('notify')
  handlePaymentNotify(@Body() notifyData: any) {
    return this.paymentService.handlePaymentNotify(notifyData);
  }

  @Public()
  @Post('notify/refund')
  handleRefundNotify(@Body() notifyData: any) {
    return this.paymentService.handleRefundNotify(notifyData);
  }

  @Put('refunds/:refundId/status')
  updateRefundStatus(
    @Param('refundId') refundId: string,
    @Body('status') status: RefundStatus,
  ) {
    return this.paymentService.updateRefundStatus(BigInt(refundId), status);
  }
}
