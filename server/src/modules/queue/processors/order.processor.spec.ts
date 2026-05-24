import { ReferralRewardService } from '@/modules/points/services/referral-reward.service';
import { PricingService } from '@/modules/pricing/pricing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bull';
import { OrderCreatedEventDto } from '../dto/order-events.dto';
import { IDispatchService } from '../interfaces/dispatch-service.interface';
import { IPaymentService } from '../interfaces/payment-service.interface';
import { DeadLetterQueueService } from '../services/dead-letter-queue.service';
import { NotificationQueueService } from '../services/notification-queue.service';
import { OrderProcessor } from './order.processor';

describe('OrderProcessor', () => {
  let processor: OrderProcessor;

  const mockNotificationQueueService = {
    sendOrderStatusNotification: jest.fn(),
  };

  const mockOrderService = {
    updateOrderAmount: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  const mockInventoryService = {
    checkInventory: jest.fn(),
    lockInventory: jest.fn(),
    releaseInventory: jest.fn(),
  };

  const mockDispatchService: Partial<IDispatchService> = {};
  const mockPaymentService: Partial<IPaymentService> = {};
  const mockPricingService = {
    estimatePricing: jest.fn().mockResolvedValue({
      pricing: { totalEstimate: { min: 10, max: 20 } },
    }),
  };
  const mockReferralRewardService = {
    processOrderRewards: jest.fn().mockResolvedValue({}),
  };

  const mockDeadLetterQueueService = {
    enqueue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderProcessor,
        {
          provide: NotificationQueueService,
          useValue: mockNotificationQueueService,
        },
        { provide: 'IOrderService', useValue: mockOrderService },
        { provide: 'IInventoryService', useValue: mockInventoryService },
        { provide: 'IDispatchService', useValue: mockDispatchService },
        { provide: 'IPaymentService', useValue: mockPaymentService },
        { provide: PricingService, useValue: mockPricingService },
        { provide: ReferralRewardService, useValue: mockReferralRewardService },
        { provide: DeadLetterQueueService, useValue: mockDeadLetterQueueService },
      ],
    }).compile();

    processor = module.get<OrderProcessor>(OrderProcessor);

    jest.clearAllMocks();
  });

  const mockJobData: OrderCreatedEventDto = {
    orderId: '123',
    userId: 'user1',
    items: [{ categoryId: 'cat1', quantity: 2, estimatedPrice: 10 }],
    address: {
      id: 'addr1',
      fullAddress: 'Test Address',
    },
    scheduledTime: new Date().toISOString(),
  };

  it('should skip inventory check for recycle order (default type)', async () => {
    const job = { data: { ...mockJobData } } as Job<OrderCreatedEventDto>;

    await processor.handleOrderCreated(job);

    expect(mockInventoryService.checkInventory).not.toHaveBeenCalled();
    expect(mockInventoryService.lockInventory).not.toHaveBeenCalled();
    expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
      '123',
      'PENDING_PICKUP',
    );
  });

  it('should skip inventory check for explicit RECYCLE order', async () => {
    const job = {
      data: { ...mockJobData, orderType: 'RECYCLE' },
    } as Job<OrderCreatedEventDto>;

    await processor.handleOrderCreated(job);

    expect(mockInventoryService.checkInventory).not.toHaveBeenCalled();
    expect(mockInventoryService.lockInventory).not.toHaveBeenCalled();
  });

  it('should perform inventory check for SALE order', async () => {
    const job = {
      data: { ...mockJobData, orderType: 'SALE' },
    } as Job<OrderCreatedEventDto>;

    mockInventoryService.checkInventory.mockResolvedValue({
      available: true,
    });

    await processor.handleOrderCreated(job);

    expect(mockInventoryService.checkInventory).toHaveBeenCalled();
    expect(mockInventoryService.lockInventory).toHaveBeenCalled();
  });

  it('should cancel and release when inventory insufficient', async () => {
    const job = {
      data: { ...mockJobData, orderType: 'SALE' },
    } as Job<OrderCreatedEventDto>;

    mockInventoryService.checkInventory.mockResolvedValue({
      available: false,
    });

    await expect(processor.handleOrderCreated(job)).rejects.toThrow(
      'Insufficient inventory',
    );

    expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
      '123',
      'INSPECTION_EXCEPTION',
    );
    expect(mockInventoryService.releaseInventory).toHaveBeenCalledWith('123');
  });
});
