import { Test, TestingModule } from '@nestjs/testing';
import { PaymentProcessor } from './payment.processor';
import { NotificationQueueService } from '../services/notification-queue.service';
import { OrderServiceClient } from '../clients/order-service.client';
import { PaymentServiceClient } from '../clients/payment-service.client';
import { DeadLetterQueueService } from '../services/dead-letter-queue.service';
import { Job } from 'bull';
import {
  PaymentCallbackEventDto,
  PaymentFailedEventDto,
  PaymentSuccessEventDto,
} from '../dto/payment-events.dto';
import { OrderStatus } from '@/common/types/business.types';

describe('PaymentProcessor', () => {
  let processor: PaymentProcessor;
  let orderServiceClient: OrderServiceClient;
  let notificationQueueService: NotificationQueueService;

  const mockOrderServiceClient = {
    getOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  const mockPaymentServiceClient = {
    isTransactionProcessed: jest.fn(),
    createPaymentLog: jest.fn(),
  };

  const mockNotificationQueueService = {
    sendOrderStatusNotification: jest.fn(),
  };

  const mockDeadLetterQueueService = {
    enqueue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentProcessor,
        {
          provide: NotificationQueueService,
          useValue: mockNotificationQueueService,
        },
        { provide: OrderServiceClient, useValue: mockOrderServiceClient },
        { provide: PaymentServiceClient, useValue: mockPaymentServiceClient },
        { provide: DeadLetterQueueService, useValue: mockDeadLetterQueueService },
      ],
    }).compile();

    processor = module.get<PaymentProcessor>(PaymentProcessor);
    orderServiceClient = module.get<OrderServiceClient>(OrderServiceClient);
    notificationQueueService = module.get<NotificationQueueService>(
      NotificationQueueService,
    );

    jest.clearAllMocks();
  });

  it('should skip duplicate payment callback', async () => {
    mockPaymentServiceClient.isTransactionProcessed.mockResolvedValue(true);
    const job = {
      data: {
        transactionId: 'tx1',
        orderId: 'o1',
        amount: 10,
        status: 'success',
        provider: 'wechat',
      },
    } as Job<PaymentCallbackEventDto>;

    const result = await processor.handlePaymentCallback(job);

    expect(result.duplicate).toBe(true);
    expect(orderServiceClient.getOrder).not.toHaveBeenCalled();
  });

  it('should reject amount mismatch', async () => {
    mockPaymentServiceClient.isTransactionProcessed.mockResolvedValue(false);
    mockOrderServiceClient.getOrder.mockResolvedValue({
      totalAmount: 20,
    });
    const job = {
      data: {
        transactionId: 'tx1',
        orderId: 'o1',
        amount: 10,
        status: 'success',
        provider: 'wechat',
      },
    } as Job<PaymentCallbackEventDto>;

    await expect(processor.handlePaymentCallback(job)).rejects.toThrow(
      'Amount mismatch',
    );
  });

  it('should reject unsupported status', async () => {
    mockPaymentServiceClient.isTransactionProcessed.mockResolvedValue(false);
    mockOrderServiceClient.getOrder.mockResolvedValue({
      totalAmount: 10,
    });
    const job = {
      data: {
        transactionId: 'tx1',
        orderId: 'o1',
        amount: 10,
        status: 'unknown',
        provider: 'wechat',
      },
    } as Job<PaymentCallbackEventDto>;

    await expect(processor.handlePaymentCallback(job)).rejects.toThrow(
      'Unsupported payment status',
    );
  });

  it('should process payment success callback', async () => {
    mockPaymentServiceClient.isTransactionProcessed.mockResolvedValue(false);
    mockOrderServiceClient.getOrder.mockResolvedValue({
      totalAmount: 10,
      userId: 'u1',
    });
    const job = {
      data: {
        transactionId: 'tx1',
        orderId: 'o1',
        amount: 10,
        status: 'success',
        provider: 'wechat',
      },
    } as Job<PaymentCallbackEventDto>;

    const result = await processor.handlePaymentCallback(job);

    expect(result.success).toBe(true);
    expect(orderServiceClient.updateOrderStatus).toHaveBeenCalledWith(
      'o1',
      OrderStatus.PENDING_PICKUP,
      expect.any(Object),
    );
    expect(
      notificationQueueService.sendOrderStatusNotification,
    ).toHaveBeenCalled();
  });

  it('should process payment failed callback', async () => {
    mockPaymentServiceClient.isTransactionProcessed.mockResolvedValue(false);
    mockOrderServiceClient.getOrder.mockResolvedValue({
      totalAmount: 10,
      userId: 'u1',
    });
    const job = {
      data: {
        transactionId: 'tx1',
        orderId: 'o1',
        amount: 10,
        status: 'failed',
        provider: 'wechat',
      },
    } as Job<PaymentCallbackEventDto>;

    const result = await processor.handlePaymentCallback(job);

    expect(result.success).toBe(true);
    expect(orderServiceClient.updateOrderStatus).toHaveBeenCalledWith(
      'o1',
      OrderStatus.CANCELLED,
      expect.any(Object),
    );
    expect(
      notificationQueueService.sendOrderStatusNotification,
    ).toHaveBeenCalled();
  });

  it('should handle payment success event', async () => {
    mockOrderServiceClient.getOrder.mockResolvedValue({
      userId: 'u1',
    });
    const job = {
      data: {
        orderId: 'o1',
        transactionId: 'tx1',
        amount: 10,
        provider: 'wechat',
      },
    } as Job<PaymentSuccessEventDto>;

    const result = await processor.handlePaymentSuccess(job);

    expect(result.success).toBe(true);
    expect(orderServiceClient.updateOrderStatus).toHaveBeenCalledWith(
      'o1',
      OrderStatus.PENDING_PICKUP,
      expect.any(Object),
    );
  });

  it('should handle payment failed event', async () => {
    mockOrderServiceClient.getOrder.mockResolvedValue({
      userId: 'u1',
    });
    const job = {
      data: {
        orderId: 'o1',
        transactionId: 'tx1',
        reason: 'timeout',
        provider: 'wechat',
      },
    } as Job<PaymentFailedEventDto>;

    const result = await processor.handlePaymentFailed(job);

    expect(result.success).toBe(true);
    expect(orderServiceClient.updateOrderStatus).toHaveBeenCalledWith(
      'o1',
      OrderStatus.CANCELLED,
      expect.any(Object),
    );
  });
});
