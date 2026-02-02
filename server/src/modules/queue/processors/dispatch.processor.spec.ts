import { Test, TestingModule } from '@nestjs/testing';
import { DispatchProcessor } from './dispatch.processor';
import { JdlLogisticsService } from '@/modules/logistics/providers/jd-provider';
import { OrderService } from '@/modules/order/services/order.service';
import { Job } from 'bull';

describe('DispatchProcessor', () => {
  let processor: DispatchProcessor;
  let jdlLogisticsService: JdlLogisticsService;
  let orderService: OrderService;

  const mockOrder = {
    id: 123n,
    orderNo: 'ORDER123',
    status: 'CONFIRMED',
    address: {
      name: 'John Doe',
      mobile: '13800000000',
      province: 'Beijing',
      city: 'Beijing',
      district: 'Chaoyang',
      detail: 'No.1 Street',
    },
    items: [
      { categoryId: 1, estimatedWeight: 1.5 },
      { categoryId: 2, estimatedWeight: 0.5 },
    ],
  };

  const mockJob = {
    id: 'job1',
    data: { orderId: '123' },
    name: 'dispatch-order',
  } as Job;

  const mockJdlLogisticsService = {
    createOrder: jest.fn(),
  };

  const mockOrderService = {
    findOne: jest.fn(),
    findLogisticsOrder: jest.fn(),
    createLogisticsOrder: jest.fn(),
    update: jest.fn(),
    saveDispatchResult: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchProcessor,
        {
          provide: JdlLogisticsService,
          useValue: mockJdlLogisticsService,
        },
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    processor = module.get<DispatchProcessor>(DispatchProcessor);
    jdlLogisticsService = module.get<JdlLogisticsService>(JdlLogisticsService);
    orderService = module.get<OrderService>(OrderService);

    jest.clearAllMocks();
  });

  it('should process dispatch order successfully', async () => {
    // Mock successful order retrieval
    mockOrderService.findOne.mockResolvedValue(mockOrder);
    // Mock no existing logistics order
    mockOrderService.findLogisticsOrder.mockResolvedValue(null);
    // Mock successful JD API call
    mockJdlLogisticsService.createOrder.mockResolvedValue({
      waybillCode: 'JD123456',
      orderId: 'ORDER123',
    });

    const result = await processor.handleDispatchOrder(mockJob);

    expect(mockOrderService.findOne).toHaveBeenCalledWith(123);

    // Verify that sender is the user and receiver is the center
    expect(mockJdlLogisticsService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'ORDER123',
        senderName: 'John Doe',
        senderMobile: '13800000000',
        senderAddress: 'BeijingBeijingChaoyangNo.1 Street',
        receiverName: 'EcoRecycle Center',
        receiverMobile: '13800138000',
        receiverAddress: 'Beijing, China',
      }),
    );

    expect(mockOrderService.saveDispatchResult).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        logisticsNo: 'JD123456',
        status: 'CREATED',
        senderName: 'John Doe',
        receiverName: 'EcoRecycle Center',
      }),
    );
    expect(result).toEqual({
      success: true,
      orderId: '123',
      logisticsNo: 'JD123456',
    });
  });

  it('should skip if logistics order already exists (Idempotency)', async () => {
    mockOrderService.findOne.mockResolvedValue(mockOrder);
    mockOrderService.findLogisticsOrder.mockResolvedValue({
      id: 1,
      logisticsNo: 'EXISTING',
    });

    await processor.handleDispatchOrder(mockJob);

    expect(mockOrderService.findLogisticsOrder).toHaveBeenCalledWith('123');
    expect(mockJdlLogisticsService.createOrder).not.toHaveBeenCalled();
    expect(mockOrderService.saveDispatchResult).not.toHaveBeenCalled();
  });

  it('should handle order not found', async () => {
    mockOrderService.findOne.mockResolvedValue(null);

    await processor.handleDispatchOrder(mockJob);

    expect(mockJdlLogisticsService.createOrder).not.toHaveBeenCalled();
  });

  it('should skip if order is not confirmed', async () => {
    mockOrderService.findOne.mockResolvedValue({
      ...mockOrder,
      status: 'PENDING',
    });

    await processor.handleDispatchOrder(mockJob);

    expect(mockJdlLogisticsService.createOrder).not.toHaveBeenCalled();
    expect(mockOrderService.saveDispatchResult).not.toHaveBeenCalled();
  });

  it('should throw error if JD API fails', async () => {
    mockOrderService.findOne.mockResolvedValue(mockOrder);
    mockOrderService.findLogisticsOrder.mockResolvedValue(null);
    mockJdlLogisticsService.createOrder.mockRejectedValue(
      new Error('API Error'),
    );

    await expect(processor.handleDispatchOrder(mockJob)).rejects.toThrow(
      'API Error',
    );
  });

  it('should throw error if JD returns no waybill code', async () => {
    mockOrderService.findOne.mockResolvedValue(mockOrder);
    mockOrderService.findLogisticsOrder.mockResolvedValue(null);
    mockJdlLogisticsService.createOrder.mockResolvedValue({
      waybillCode: null,
    });

    await expect(processor.handleDispatchOrder(mockJob)).rejects.toThrow(
      'Failed to get logistics number from JDL',
    );
  });
});
