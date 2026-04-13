import { Test, TestingModule } from '@nestjs/testing';
import { OrderProcessor } from './order.processor';
import { NotificationQueueService } from '../services/notification-queue.service';
import { OrderServiceClient } from '../clients/order-service.client';
import { InventoryServiceClient } from '../clients/inventory-service.client';
import { DispatchServiceClient } from '../clients/dispatch-service.client';
import { PaymentServiceClient } from '../clients/payment-service.client';
import { Job } from 'bull';
import { OrderCreatedEventDto } from '../dto/order-events.dto';
import { PricingService } from '@/modules/pricing/pricing.service';
import { ReferralRewardService } from '@/modules/points/services/referral-reward.service';

describe('OrderProcessor', () => {
  let processor: OrderProcessor;
  let inventoryServiceClient: InventoryServiceClient;
  let orderServiceClient: OrderServiceClient;

  const mockNotificationQueueService = {
    sendOrderStatusNotification: jest.fn(),
  };

  const mockOrderServiceClient = {
    updateOrderAmount: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  const mockInventoryServiceClient = {
    checkInventory: jest.fn(),
    lockInventory: jest.fn(),
    releaseInventory: jest.fn(),
  };

  const mockDispatchServiceClient = {};
  const mockPaymentServiceClient = {};
  const mockPricingService = {
    estimatePricing: jest.fn().mockResolvedValue({
      pricing: { totalEstimate: { min: 10, max: 20 } },
    }),
  };
  const mockReferralRewardService = {
    processOrderRewards: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderProcessor,
        {
          provide: NotificationQueueService,
          useValue: mockNotificationQueueService,
        },
        { provide: OrderServiceClient, useValue: mockOrderServiceClient },
        {
          provide: InventoryServiceClient,
          useValue: mockInventoryServiceClient,
        },
        { provide: DispatchServiceClient, useValue: mockDispatchServiceClient },
        { provide: PaymentServiceClient, useValue: mockPaymentServiceClient },
        { provide: PricingService, useValue: mockPricingService },
        { provide: ReferralRewardService, useValue: mockReferralRewardService },
      ],
    }).compile();

    processor = module.get<OrderProcessor>(OrderProcessor);
    inventoryServiceClient = module.get<InventoryServiceClient>(
      InventoryServiceClient,
    );
    orderServiceClient = module.get<OrderServiceClient>(OrderServiceClient);

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

    expect(inventoryServiceClient.checkInventory).not.toHaveBeenCalled();
    expect(inventoryServiceClient.lockInventory).not.toHaveBeenCalled();
    expect(orderServiceClient.updateOrderStatus).toHaveBeenCalledWith(
      '123',
      'PENDING_PICKUP',
    );
  });

  it('should skip inventory check for explicit RECYCLE order', async () => {
    const job = {
      data: { ...mockJobData, orderType: 'RECYCLE' },
    } as Job<OrderCreatedEventDto>;

    await processor.handleOrderCreated(job);

    expect(inventoryServiceClient.checkInventory).not.toHaveBeenCalled();
    expect(inventoryServiceClient.lockInventory).not.toHaveBeenCalled();
  });

  it('should perform inventory check for SALE order', async () => {
    const job = {
      data: { ...mockJobData, orderType: 'SALE' },
    } as Job<OrderCreatedEventDto>;

    mockInventoryServiceClient.checkInventory.mockResolvedValue({
      available: true,
    });

    await processor.handleOrderCreated(job);

    expect(inventoryServiceClient.checkInventory).toHaveBeenCalled();
    expect(inventoryServiceClient.lockInventory).toHaveBeenCalled();
  });

  it('should cancel and release when inventory insufficient', async () => {
    const job = {
      data: { ...mockJobData, orderType: 'SALE' },
    } as Job<OrderCreatedEventDto>;

    mockInventoryServiceClient.checkInventory.mockResolvedValue({
      available: false,
    });

    await expect(processor.handleOrderCreated(job)).rejects.toThrow(
      'Insufficient inventory',
    );

    expect(orderServiceClient.updateOrderStatus).toHaveBeenCalledWith(
      '123',
      'INSPECTION_EXCEPTION',
    );
    expect(inventoryServiceClient.releaseInventory).toHaveBeenCalledWith('123');
  });
});
