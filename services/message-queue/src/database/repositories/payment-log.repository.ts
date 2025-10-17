import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreatePaymentLogDto {
    orderId: string;
    transactionId: string;
    status: string;
    amount: number;
    provider: string;
    reason?: string;
}

@Injectable()
export class PaymentLogRepository {
    private readonly logger = new Logger(PaymentLogRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * 创建支付日志
     */
    async createPaymentLog(data: CreatePaymentLogDto): Promise<any> {
        try {
            // 由于message-queue服务可能没有PaymentLog表，我们使用JobStatus表来记录
            // 或者简单地记录到日志中
            this.logger.log(`Payment log created: ${JSON.stringify(data)}`);

            // 如果有PaymentLog表，使用以下代码：
            // return await this.prisma.paymentLog.create({
            //   data: {
            //     orderId: data.orderId,
            //     transactionId: data.transactionId,
            //     status: data.status,
            //     amount: data.amount,
            //     provider: data.provider,
            //     reason: data.reason,
            //   },
            // });

            // 临时方案：使用JobStatus表记录
            return await this.prisma.jobStatus.create({
                data: {
                    jobId: data.transactionId,
                    jobType: 'payment-log',
                    queueName: 'payment',
                    status: data.status,
                    payload: {
                        orderId: data.orderId,
                        transactionId: data.transactionId,
                        amount: data.amount,
                        provider: data.provider,
                        reason: data.reason,
                    },
                },
            });
        } catch (error) {
            this.logger.error(`Failed to create payment log: ${error.message}`, error.stack);
            // 不抛出错误，避免影响主流程
            return null;
        }
    }

    /**
     * 检查交易是否已处理（幂等性检查）
     */
    async isTransactionProcessed(transactionId: string): Promise<boolean> {
        try {
            // 使用JobStatus表检查
            const existing = await this.prisma.jobStatus.findFirst({
                where: {
                    jobId: transactionId,
                    jobType: 'payment-log',
                },
            });

            return !!existing;
        } catch (error) {
            this.logger.error(`Failed to check transaction: ${error.message}`, error.stack);
            // 如果检查失败，返回false以允许处理
            return false;
        }
    }

    /**
     * 根据订单ID查找支付日志
     */
    async findByOrderId(orderId: string): Promise<any[]> {
        try {
            return await this.prisma.jobStatus.findMany({
                where: {
                    jobType: 'payment-log',
                    payload: {
                        path: ['orderId'],
                        equals: orderId,
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            this.logger.error(`Failed to find payment logs: ${error.message}`, error.stack);
            return [];
        }
    }

    /**
     * 根据交易ID查找支付日志
     */
    async findByTransactionId(transactionId: string): Promise<any | null> {
        try {
            return await this.prisma.jobStatus.findFirst({
                where: {
                    jobId: transactionId,
                    jobType: 'payment-log',
                },
            });
        } catch (error) {
            this.logger.error(`Failed to find payment log: ${error.message}`, error.stack);
            return null;
        }
    }

    /**
     * 获取支付统计
     */
    async getPaymentStats(startDate: Date, endDate: Date): Promise<{
        total: number;
        success: number;
        failed: number;
        refunded: number;
        totalAmount: number;
    }> {
        try {
            const logs = await this.prisma.jobStatus.findMany({
                where: {
                    jobType: 'payment-log',
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            const stats = {
                total: logs.length,
                success: 0,
                failed: 0,
                refunded: 0,
                totalAmount: 0,
            };

            logs.forEach((log) => {
                const payload = log.payload as any;
                if (log.status === 'success') {
                    stats.success++;
                    stats.totalAmount += payload.amount || 0;
                } else if (log.status === 'failed') {
                    stats.failed++;
                } else if (log.status === 'refunded') {
                    stats.refunded++;
                }
            });

            return stats;
        } catch (error) {
            this.logger.error(`Failed to get payment stats: ${error.message}`, error.stack);
            return {
                total: 0,
                success: 0,
                failed: 0,
                refunded: 0,
                totalAmount: 0,
            };
        }
    }
}
