import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
// 修复导入语句
import { PaymentStatus, RefundStatus } from '@prisma/client';
import { Public } from '@/common/decorators/auth.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

class CreateRefundDto {
  @IsNumber()
  @Min(0.01)
  refundAmount!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

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
  handlePaymentNotify(@Body() notifyData: any) {
    return this.paymentService.handlePaymentNotify(notifyData);
  }

  @Public()
  @Post('notify/refund')
  handleRefundNotify(@Body() notifyData: any) {
    return this.paymentService.handleRefundNotify(notifyData);
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
