import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, createTestPaymentDto, createTestPaymentRecord, createTestRefundRecord } from '../../tests/test-utils';
import { PaymentService } from './payment.service';
import { PaymentStatus, RefundStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';



describe('PaymentService', () => {
  let service: PaymentService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new payment successfully', async () => {
      const createPaymentDto = createTestPaymentDto();
      const expectedPayment = createTestPaymentRecord();

      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.payment.create as jest.Mock).mockResolvedValue(expectedPayment);

      const result = await service.create(createPaymentDto);

      expect(prismaService.payment.findFirst).toHaveBeenCalledWith({
        where: {
          orderId: BigInt(createPaymentDto.orderId),
          status: PaymentStatus.SUCCESS
        }
      });
      expect(prismaService.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: BigInt(createPaymentDto.orderId),
          provider: createPaymentDto.provider,
          total: createPaymentDto.amount,
          status: PaymentStatus.PENDING,
        })
      });
      expect(result).toEqual(expectedPayment);
    });

    it('should throw ConflictException if payment already exists', async () => {
      const createPaymentDto = createTestPaymentDto();
      const existingPayment = { ...createTestPaymentRecord(), status: PaymentStatus.SUCCESS };

      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(existingPayment);

      await expect(service.create(createPaymentDto)).rejects.toThrow(ConflictException);
      expect(prismaService.payment.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a payment by id', async () => {
      const paymentId = '1';
      const expectedPayment = createTestPaymentRecord();

      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(expectedPayment);

      const result = await service.findOne(paymentId);

      expect(prismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(paymentId) },
        include: { refunds: true }
      });
      expect(result).toEqual(expectedPayment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      const paymentId = '999';

      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(paymentId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOrderId', () => {
    it('should return payments by order id', async () => {
      const orderId = '1';
      const expectedPayments = [createTestPaymentRecord()];

      (prismaService.payment.findMany as jest.Mock).mockResolvedValue(expectedPayments);

      const result = await service.findByOrderId(orderId);

      expect(prismaService.payment.findMany).toHaveBeenCalledWith({
        where: { orderId: BigInt(orderId) },
        include: { refunds: true },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(expectedPayments);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const transactionId = 'TEST_TXN123456789';
      const status = PaymentStatus.SUCCESS;
      const existingPayment = { ...createTestPaymentRecord(), status: PaymentStatus.SUCCESS };
      const updatedPayment = { ...existingPayment, status };

      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(existingPayment);
      (prismaService.payment.update as jest.Mock).mockResolvedValue(updatedPayment);

      const result = await service.updatePaymentStatus(transactionId, status);

      expect(prismaService.payment.findFirst).toHaveBeenCalledWith({
        where: { transactionId }
      });
      expect(prismaService.payment.update).toHaveBeenCalledWith({
        where: { id: existingPayment.id },
        data: { status, updatedAt: expect.any(Date) }
      });
      expect(result).toEqual(updatedPayment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      const transactionId = 'INVALID_TXN';
      const status = PaymentStatus.SUCCESS;

      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.updatePaymentStatus(transactionId, status)).rejects.toThrow(NotFoundException);
      expect(prismaService.payment.update).not.toHaveBeenCalled();
    });
  });

  describe('createRefund', () => {
    it('should create a refund successfully', async () => {
      const paymentId = '1';
      const refundAmount = 50.00;
      const reason = 'Test refund';
      const existingPayment = { ...createTestPaymentRecord(), status: PaymentStatus.SUCCESS };
      const expectedRefund = createTestRefundRecord();

      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(existingPayment);
      (prismaService.refund.create as jest.Mock).mockResolvedValue(expectedRefund);

      const result = await service.createRefund(paymentId, refundAmount, reason);

      expect(prismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(paymentId) }
      });
      expect(prismaService.refund.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          paymentId: BigInt(paymentId),
          refundAmount,
          reason,
          status: RefundStatus.PROCESSING,
        })
      });
      expect(result).toEqual(expectedRefund);
    });

    it('should throw NotFoundException if payment not found', async () => {
      const paymentId = '999';
      const refundAmount = 50.00;

      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createRefund(paymentId, refundAmount)).rejects.toThrow(NotFoundException);
      expect(prismaService.refund.create).not.toHaveBeenCalled();
    });
  });

  describe('updateRefundStatus', () => {
    it('should update refund status successfully', async () => {
      const refundId = '1';
      const status = RefundStatus.SUCCESS;
      const existingRefund = createTestRefundRecord();
      const updatedRefund = { ...existingRefund, status };

      (prismaService.refund.findUnique as jest.Mock).mockResolvedValue(existingRefund);
      (prismaService.refund.update as jest.Mock).mockResolvedValue(updatedRefund);

      const result = await service.updateRefundStatus(refundId, status);

      expect(prismaService.refund.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(refundId) }
      });
      expect(prismaService.refund.update).toHaveBeenCalledWith({
        where: { id: BigInt(refundId) },
        data: { status: status }
      });
      expect(result).toEqual(updatedRefund);
    });

    it('should throw NotFoundException if refund not found', async () => {
      const refundId = '999';
      const status = RefundStatus.SUCCESS;

      (prismaService.refund.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateRefundStatus(refundId, status)).rejects.toThrow(NotFoundException);
      expect(prismaService.refund.update).not.toHaveBeenCalled();
    });
  });

  describe('handlePaymentNotify', () => {
    it('should handle payment notification successfully', async () => {
      const notifyData = {
        outTradeNo: 'TEST_OUT123456789',
        transactionId: 'TEST_TXN123456789',
        totalFee: '100.00',
        tradeState: 'SUCCESS',
        notifyRaw: JSON.stringify({ test: 'data' }),
      };
      const existingPayment = createTestPaymentRecord();
      const updatedPayment = { ...existingPayment, status: PaymentStatus.SUCCESS };

      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(existingPayment);
      (prismaService.payment.update as jest.Mock).mockResolvedValue(updatedPayment);

      const result = await service.handlePaymentNotify(notifyData);

      expect(prismaService.payment.findFirst).toHaveBeenCalledWith({
        where: { outTradeNo: notifyData.outTradeNo }
      });
      expect(prismaService.payment.update).toHaveBeenCalledWith({
        where: { id: existingPayment.id },
        data: {
          transactionId: notifyData.transactionId,
          status: PaymentStatus.SUCCESS,
          notifyRaw: notifyData.notifyRaw,
          updatedAt: expect.any(Date)
        }
      });
      expect(result).toEqual(updatedPayment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      const notifyData = {
        outTradeNo: 'INVALID_OUT',
        transactionId: 'TEST_TXN123456789',
        totalFee: '100.00',
        tradeState: 'SUCCESS',
        notifyRaw: JSON.stringify({ test: 'data' }),
      };

      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.handlePaymentNotify(notifyData)).rejects.toThrow(NotFoundException);
      expect(prismaService.payment.update).not.toHaveBeenCalled();
    });
  });

  describe('handleRefundNotify', () => {
    it('should handle refund notification successfully', async () => {
      const notifyData = {
        outRefundNo: 'TEST_REF123456789',
        refundStatus: 'SUCCESS',
        successTime: new Date().toISOString(),
        notifyRaw: JSON.stringify({ test: 'refund data' }),
      };
      const existingRefund = createTestRefundRecord();
      const updatedRefund = { ...existingRefund, status: RefundStatus.SUCCESS };

      (prismaService.refund.findFirst as jest.Mock).mockResolvedValue(existingRefund);
      (prismaService.refund.update as jest.Mock).mockResolvedValue(updatedRefund);

      const result = await service.handleRefundNotify(notifyData);

      expect(prismaService.refund.findFirst).toHaveBeenCalledWith({
        where: { outRefundNo: notifyData.outRefundNo }
      });
      expect(prismaService.refund.update).toHaveBeenCalledWith({
        where: { id: existingRefund.id },
        data: {
          status: RefundStatus.SUCCESS,
          notifyRaw: notifyData.notifyRaw,
          updatedAt: expect.any(Date)
        }
      });
      expect(result).toEqual(updatedRefund);
    });

    it('should throw NotFoundException if refund not found', async () => {
      const notifyData = {
        outRefundNo: 'INVALID_REF',
        refundStatus: 'SUCCESS',
        successTime: new Date().toISOString(),
        notifyRaw: JSON.stringify({ test: 'refund data' }),
      };

      (prismaService.refund.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.handleRefundNotify(notifyData)).rejects.toThrow(NotFoundException);
      expect(prismaService.refund.update).not.toHaveBeenCalled();
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics', async () => {
      const mockStats = {
        totalPayments: 100,
        successfulPayments: 80,
        failedPayments: 10,
        pendingPayments: 10,
        totalAmount: 10000.00,
        totalRefunds: 5,
        totalRefundAmount: 500.00,
      };

      // Mock multiple Prisma calls for statistics
      (prismaService.payment.count as jest.Mock)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80)  // successful
        .mockResolvedValueOnce(10)  // failed
        .mockResolvedValueOnce(10); // pending

      (prismaService.payment.findMany as jest.Mock).mockResolvedValue([
        { total: new Decimal(10000.00) }
      ]);

      (prismaService.refund.count as jest.Mock).mockResolvedValue(5);
      (prismaService.refund.findMany as jest.Mock).mockResolvedValue([
        { refundAmount: new Decimal(500.00) }
      ]);

      const result = await service.getPaymentStats();

      expect(result).toEqual(expect.objectContaining({
        totalPayments: 100,
        successfulPayments: 80,
        failedPayments: 10,
        pendingPayments: 10,
      }));
    });
  });
});