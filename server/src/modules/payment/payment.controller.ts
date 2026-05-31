import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentProvider, PaymentStatus, RefundStatus } from '@prisma/client';
import { Public } from '@/common/decorators/auth.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CreateRefundDto } from './dto/create-refund.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Roles('ADMIN')
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

  @Roles('ADMIN')
  @Post(':paymentId/refunds')
  createRefund(
    @Param('paymentId') paymentId: string,
    @Body() refundDto: CreateRefundDto,
  ) {
    return this.paymentService.createRefund(
      BigInt(paymentId),
      refundDto.refundAmount,
      refundDto.reason,
    );
  }

  @Public()
  @Post('notify')
  async handlePaymentNotify(@Body() notifyData: any, @Res() res: Response) {
    try {
      const payment = await this.paymentService.handlePaymentNotify(notifyData);
      const provider = (payment as any)?.provider as PaymentProvider;

      if (provider === PaymentProvider.WECHAT) {
        res
          .contentType('application/xml')
          .send('<xml><return_code>SUCCESS</return_code></xml>');
      } else {
        res.contentType('text/plain').send('success');
      }
    } catch (error) {
      const provider = await this.paymentService
        .findByOutTradeNo(notifyData.outTradeNo)
        .then((p) => (p as any)?.provider as PaymentProvider)
        .catch(() => undefined);

      if (provider === PaymentProvider.WECHAT) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        res
          .contentType('application/xml')
          .send(
            `<xml><return_code>FAIL</return_code><return_msg>${msg}</return_msg></xml>`,
          );
      } else {
        res.contentType('text/plain').send('fail');
      }
    }
  }

  @Public()
  @Post('notify/refund')
  async handleRefundNotify(@Body() notifyData: any, @Res() res: Response) {
    try {
      const refund = await this.paymentService.handleRefundNotify(notifyData);
      const provider = (refund as any)?.payment?.provider as PaymentProvider;

      if (provider === PaymentProvider.WECHAT) {
        res
          .contentType('application/xml')
          .send('<xml><return_code>SUCCESS</return_code></xml>');
      } else {
        res.contentType('text/plain').send('success');
      }
    } catch (error) {
      let provider: PaymentProvider | undefined;
      try {
        const refund = await this.paymentService.findRefundByOutRefundNo(
          notifyData.outRefundNo,
        );
        provider = (refund as any)?.payment?.provider as PaymentProvider;
      } catch {
        provider = undefined;
      }

      if (provider === PaymentProvider.WECHAT) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        res
          .contentType('application/xml')
          .send(
            `<xml><return_code>FAIL</return_code><return_msg>${msg}</return_msg></xml>`,
          );
      } else {
        res.contentType('text/plain').send('fail');
      }
    }
  }

  @Roles('ADMIN')
  @Put('refunds/:refundId/status')
  updateRefundStatus(
    @Param('refundId') refundId: string,
    @Body('status') status: RefundStatus,
  ) {
    return this.paymentService.updateRefundStatus(BigInt(refundId), status);
  }
}
