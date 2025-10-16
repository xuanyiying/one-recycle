import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountService } from '../account/account.service';
import { CreateWithdrawalDto, WithdrawalFiltersDto } from './dto';
import { WithdrawalEntity } from './entities/withdrawal.entity';
import {
  WithdrawalNotFoundException,
  MinimumWithdrawalAmountException,
  DuplicateWithdrawalException,
  WithdrawalAlreadyProcessedException,
  PaymentProviderException,
  PaymentCallbackVerificationException,
} from './exceptions/withdrawal.exceptions';
import { InsufficientBalanceException } from '../account/exceptions/account.exceptions';
import { WithdrawalStatus, Prisma, TransactionType } from '../prisma/generated/client';
import { randomBytes } from 'crypto';
import { PaymentProviderFactory } from '../payment-provider';
import { TransferStatus } from '../payment-provider/interfaces/payment-provider.interface';
import { MessageQueueClient } from '../common/message-queue.client';
import { SnowflakeIdGenerator } from '@one-recycle/shared';

@Injectable()
export class WithdrawalService {
  private readonly logger = new Logger(WithdrawalService.name);
  private readonly MIN_WITHDRAWAL_AMOUNT = 10;
  private readonly idGenerator = new SnowflakeIdGenerator({ workerId: 7, datacenterId: 1 });

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountService: AccountService,
    private readonly paymentProviderFactory: PaymentProviderFactory,
    private readonly messageQueueClient: MessageQueueClient,
  ) {}

  /**
   * 生成唯一的提现订单号
   * 格式: WD + 雪花算法ID
   */
  private generateOutTradeNo(): string {
    return `WD${this.idGenerator.nextId()}`;
  }

  /**
   * 创建提现申请
   * 1. 验证金额（最低10元）
   * 2. 验证用户余额是否足够
   * 3. 冻结余额
   * 4. 创建提现记录
   */
  async createWithdrawal(
    userId: number,
    dto: CreateWithdrawalDto,
  ): Promise<WithdrawalEntity> {
    this.logger.log(`Creating withdrawal for user ${userId}, amount: ${dto.amount}`);

    // 验证最低提现金额
    if (dto.amount < this.MIN_WITHDRAWAL_AMOUNT) {
      throw new MinimumWithdrawalAmountException(this.MIN_WITHDRAWAL_AMOUNT);
    }

    // 获取用户账户
    const account = await this.accountService.getAccount(userId);

    // 验证可用余额是否足够
    const availableBalance = Number(account.availableBalance);
    if (availableBalance < dto.amount) {
      throw new InsufficientBalanceException(availableBalance, dto.amount);
    }

    // 生成唯一订单号
    const outTradeNo = this.generateOutTradeNo();

    // 检查订单号是否已存在（防止极端情况下的重复）
    const existingWithdrawal = await this.prisma.withdrawal.findUnique({
      where: { outTradeNo },
    });

    if (existingWithdrawal) {
      throw new DuplicateWithdrawalException(outTradeNo);
    }

    // 使用事务：冻结余额 + 创建提现记录
    const withdrawal = await this.prisma.$transaction(async (tx) => {
      // 冻结余额
      await this.accountService.freezeBalance(
        userId,
        dto.amount,
        outTradeNo,
        tx,
      );

      // 创建提现记录
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          accountId: account.id,
          userId: BigInt(userId),
          amount: dto.amount,
          provider: dto.provider,
          outTradeNo,
          status: WithdrawalStatus.PENDING,
          accountInfo: dto.accountInfo as any,
        },
      });

      return newWithdrawal;
    });

    this.logger.log(
      `Withdrawal created successfully: ${withdrawal.id}, outTradeNo: ${outTradeNo}`,
    );

    // 发布提现创建事件到消息队列
    await this.messageQueueClient.publishWithdrawalCreated({
      withdrawalId: withdrawal.id.toString(),
      userId: userId.toString(),
      amount: dto.amount,
      provider: dto.provider,
      outTradeNo,
      createdAt: withdrawal.createdAt.toISOString(),
    });

    return new WithdrawalEntity(withdrawal);
  }

  /**
   * 查询提现记录（用户）
   * 支持状态筛选、时间范围筛选、分页
   */
  async getWithdrawals(
    userId: number,
    filters: WithdrawalFiltersDto,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ withdrawals: WithdrawalEntity[]; total: number }> {
    this.logger.log(`Getting withdrawals for user ${userId}`);

    const where: Prisma.WithdrawalWhereInput = {
      userId: BigInt(userId),
    };

    // 应用筛选条件
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    // 查询总数
    const total = await this.prisma.withdrawal.count({ where });

    // 查询分页数据
    const withdrawals = await this.prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      withdrawals: withdrawals.map((w) => new WithdrawalEntity(w)),
      total,
    };
  }

  /**
   * 查询单个提现记录
   * 验证用户权限
   */
  async getWithdrawal(
    withdrawalId: string,
    userId?: number,
  ): Promise<WithdrawalEntity> {
    this.logger.log(`Getting withdrawal ${withdrawalId}`);

    const where: Prisma.WithdrawalWhereInput = {
      id: BigInt(withdrawalId),
    };

    // 如果提供了userId，验证所有权
    if (userId !== undefined) {
      where.userId = BigInt(userId);
    }

    const withdrawal = await this.prisma.withdrawal.findFirst({ where });

    if (!withdrawal) {
      throw new WithdrawalNotFoundException(withdrawalId);
    }

    return new WithdrawalEntity(withdrawal);
  }

  /**
   * 获取待处理提现列表（管理员）
   * 仅返回状态为PENDING的提现记录
   */
  async getPendingWithdrawals(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ withdrawals: WithdrawalEntity[]; total: number }> {
    this.logger.log('Getting pending withdrawals for admin');

    const where: Prisma.WithdrawalWhereInput = {
      status: WithdrawalStatus.PENDING,
    };

    // 查询总数
    const total = await this.prisma.withdrawal.count({ where });

    // 查询分页数据
    const withdrawals = await this.prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'asc' }, // 按创建时间升序，优先处理早期申请
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      withdrawals: withdrawals.map((w) => new WithdrawalEntity(w)),
      total,
    };
  }

  /**
   * 根据outTradeNo查询提现记录
   * 用于支付回调处理
   */
  async getWithdrawalByOutTradeNo(outTradeNo: string): Promise<WithdrawalEntity> {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { outTradeNo },
    });

    if (!withdrawal) {
      throw new WithdrawalNotFoundException(outTradeNo);
    }

    return new WithdrawalEntity(withdrawal);
  }

  /**
   * 处理提现（管理员审核通过）
   * 1. 验证提现状态
   * 2. 调用支付接口
   * 3. 更新提现状态
   * 4. 扣除冻结余额
   */
  async processWithdrawal(
    withdrawalId: string,
    adminId: number,
  ): Promise<WithdrawalEntity> {
    this.logger.log(`Processing withdrawal ${withdrawalId} by admin ${adminId}`);

    // 查询提现记录
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: BigInt(withdrawalId) },
    });

    if (!withdrawal) {
      throw new WithdrawalNotFoundException(withdrawalId);
    }

    // 验证状态（只能处理PENDING状态的提现）
    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new WithdrawalAlreadyProcessedException(withdrawalId);
    }

    // 更新状态为PROCESSING
    await this.prisma.withdrawal.update({
      where: { id: BigInt(withdrawalId) },
      data: {
        status: WithdrawalStatus.PROCESSING,
        adminId: BigInt(adminId),
        processedAt: new Date(),
      },
    });

    try {
      // 获取支付提供商
      const provider = this.paymentProviderFactory.getProvider(withdrawal.provider);

      // 调用支付接口
      const result = await provider.transfer(
        Number(withdrawal.amount),
        withdrawal.accountInfo as any,
        withdrawal.outTradeNo,
        `OneRecycle提现 - ${withdrawal.outTradeNo}`,
      );

      if (result.success) {
        // 支付成功：扣除冻结余额，更新提现状态
        // 注意：deductFrozenBalance内部已经使用事务，所以分开调用
        await this.accountService.deductFrozenBalance(
          Number(withdrawal.userId),
          Number(withdrawal.amount),
          withdrawal.outTradeNo,
        );

        const updatedWithdrawal = await this.prisma.withdrawal.update({
          where: { id: BigInt(withdrawalId) },
          data: {
            status: WithdrawalStatus.SUCCESS,
            transactionId: result.transactionId,
            callbackData: result as any,
          },
        });

        this.logger.log(`Withdrawal ${withdrawalId} processed successfully`);

        // 发布提现完成事件（成功）
        await this.messageQueueClient.publishWithdrawalCompleted({
          withdrawalId: updatedWithdrawal.id.toString(),
          userId: updatedWithdrawal.userId.toString(),
          amount: Number(updatedWithdrawal.amount),
          status: 'SUCCESS',
          transactionId: result.transactionId,
          completedAt: new Date().toISOString(),
        });

        return new WithdrawalEntity(updatedWithdrawal);
      } else {
        // 支付失败：解冻余额，更新提现状态
        await this.accountService.unfreezeBalance(
          Number(withdrawal.userId),
          Number(withdrawal.amount),
          withdrawal.outTradeNo,
        );

        const updatedWithdrawal = await this.prisma.withdrawal.update({
          where: { id: BigInt(withdrawalId) },
          data: {
            status: WithdrawalStatus.FAILED,
            callbackData: result as any,
          },
        });

        this.logger.error(
          `Withdrawal ${withdrawalId} failed: ${result.message}`,
        );

        // 发布提现完成事件（失败）
        await this.messageQueueClient.publishWithdrawalCompleted({
          withdrawalId: updatedWithdrawal.id.toString(),
          userId: updatedWithdrawal.userId.toString(),
          amount: Number(updatedWithdrawal.amount),
          status: 'FAILED',
          completedAt: new Date().toISOString(),
        });

        throw new PaymentProviderException(
          withdrawal.provider,
          result.message || '支付失败',
        );
      }
    } catch (error) {
      // 发生异常：解冻余额，更新提现状态
      await this.accountService.unfreezeBalance(
        Number(withdrawal.userId),
        Number(withdrawal.amount),
        withdrawal.outTradeNo,
      );

      await this.prisma.withdrawal.update({
        where: { id: BigInt(withdrawalId) },
        data: {
          status: WithdrawalStatus.FAILED,
          callbackData: { error: error.message } as any,
        },
      });

      throw error;
    }
  }

  /**
   * 拒绝提现（管理员审核拒绝）
   * 1. 验证提现状态
   * 2. 解冻余额
   * 3. 更新提现状态
   */
  async rejectWithdrawal(
    withdrawalId: string,
    adminId: number,
    reason: string,
  ): Promise<WithdrawalEntity> {
    this.logger.log(`Rejecting withdrawal ${withdrawalId} by admin ${adminId}`);

    // 查询提现记录
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: BigInt(withdrawalId) },
    });

    if (!withdrawal) {
      throw new WithdrawalNotFoundException(withdrawalId);
    }

    // 验证状态（只能拒绝PENDING状态的提现）
    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new WithdrawalAlreadyProcessedException(withdrawalId);
    }

    // 解冻余额（内部已使用事务）
    await this.accountService.unfreezeBalance(
      Number(withdrawal.userId),
      Number(withdrawal.amount),
      withdrawal.outTradeNo,
    );

    // 更新提现状态
    const updatedWithdrawal = await this.prisma.withdrawal.update({
      where: { id: BigInt(withdrawalId) },
      data: {
        status: WithdrawalStatus.REJECTED,
        adminId: BigInt(adminId),
        processedAt: new Date(),
        rejectedReason: reason,
      },
    });

    this.logger.log(`Withdrawal ${withdrawalId} rejected: ${reason}`);

    // 发布提现完成事件（拒绝）
    await this.messageQueueClient.publishWithdrawalCompleted({
      withdrawalId: updatedWithdrawal.id.toString(),
      userId: updatedWithdrawal.userId.toString(),
      amount: Number(updatedWithdrawal.amount),
      status: 'REJECTED',
      rejectedReason: reason,
      completedAt: new Date().toISOString(),
    });

    return new WithdrawalEntity(updatedWithdrawal);
  }

  /**
   * 处理支付回调
   * 1. 验证回调签名
   * 2. 查询提现记录
   * 3. 幂等性检查
   * 4. 更新提现状态
   * 5. 扣除冻结余额（如果成功）
   */
  async handlePaymentCallback(
    outTradeNo: string,
    callbackData: any,
  ): Promise<void> {
    this.logger.log(`Handling payment callback for ${outTradeNo}`);

    // 查询提现记录
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { outTradeNo },
    });

    if (!withdrawal) {
      this.logger.warn(`Withdrawal not found for callback: ${outTradeNo}`);
      throw new WithdrawalNotFoundException(outTradeNo);
    }

    // 幂等性检查：如果已经是最终状态，直接返回
    if (
      withdrawal.status === WithdrawalStatus.SUCCESS ||
      withdrawal.status === WithdrawalStatus.FAILED ||
      withdrawal.status === WithdrawalStatus.REJECTED
    ) {
      this.logger.warn(
        `Withdrawal ${withdrawal.id} already in final status: ${withdrawal.status}`,
      );
      return;
    }

    // 获取支付提供商并验证签名
    const provider = this.paymentProviderFactory.getProvider(withdrawal.provider);
    const isValid = provider.verifyCallback(callbackData);

    if (!isValid) {
      this.logger.error(`Callback signature verification failed for ${outTradeNo}`);
      throw new PaymentCallbackVerificationException();
    }

    // 解析回调数据，判断支付结果
    const isSuccess = this.parseCallbackResult(callbackData, withdrawal.provider);

    if (isSuccess) {
      // 支付成功：扣除冻结余额
      await this.accountService.deductFrozenBalance(
        Number(withdrawal.userId),
        Number(withdrawal.amount),
        withdrawal.outTradeNo,
      );

      // 更新提现状态
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: WithdrawalStatus.SUCCESS,
          transactionId: callbackData.transaction_id || callbackData.payment_no,
          callbackData: callbackData as any,
        },
      });

      this.logger.log(`Withdrawal ${withdrawal.id} completed via callback`);
    } else {
      // 支付失败：解冻余额
      await this.accountService.unfreezeBalance(
        Number(withdrawal.userId),
        Number(withdrawal.amount),
        withdrawal.outTradeNo,
      );

      // 更新提现状态
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: WithdrawalStatus.FAILED,
          callbackData: callbackData as any,
        },
      });

      this.logger.log(`Withdrawal ${withdrawal.id} failed via callback`);
    }
  }

  /**
   * 解析回调结果
   * 根据不同支付提供商的回调格式判断支付是否成功
   */
  private parseCallbackResult(callbackData: any, provider: string): boolean {
    if (provider === 'WECHAT') {
      // 微信支付：result_code === 'SUCCESS'
      return callbackData.result_code === 'SUCCESS';
    } else if (provider === 'ALIPAY') {
      // 支付宝：status === 'SUCCESS'
      return callbackData.status === 'SUCCESS';
    }

    return false;
  }
}
