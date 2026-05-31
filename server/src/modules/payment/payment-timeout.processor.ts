import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PaymentStatus } from '@prisma/client';
import { QUEUE_NAMES } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';

@Processor(QUEUE_NAMES.PAYMENT_TIMEOUT)
export class PaymentTimeoutProcessor {
  private readonly logger = new Logger(PaymentTimeoutProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('payment-timeout')
  async handlePaymentTimeout(job: Job<{ paymentId: bigint }>): Promise<any> {
    const { paymentId } = job.data;

    this.logger.log(
      `Processing payment timeout check for payment ID: ${paymentId}`,
    );

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for timeout check: ${paymentId}`);
      return { success: false, reason: 'PAYMENT_NOT_FOUND' };
    }

    if (payment.status !== PaymentStatus.PENDING) {
      this.logger.log(
        `Payment ${paymentId} already processed with status: ${payment.status}`,
      );
      return { success: true, skipped: true, status: payment.status };
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        closedAt: new Date(),
      },
    });

    this.logger.log(`Payment ${paymentId} timed out and marked as FAILED`);
    return { success: true, paymentId: paymentId.toString(), status: 'FAILED' };
  }
}
