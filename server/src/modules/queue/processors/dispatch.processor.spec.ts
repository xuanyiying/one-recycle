import { Test, TestingModule } from '@nestjs/testing';
import { DispatchProcessor } from './dispatch.processor';
import { LogisticsIntegrationService } from '@/modules/logistics/logistics-integration.service';
import { OrderService } from '@/modules/order/services/order.service';
import { TenantService } from '@/modules/tenant/tenant.service';
import { SettlementService } from '@/modules/tenant/settlement.service';
import { OrderStatus } from '@/common';
import { Job } from 'bull';

describe('DispatchProcessor', () => {
  let processor: DispatchProcessor;

  const mockOrder = {
    id: 123n,
    orderNo: 'ORDER123',
    status: OrderStatus.PENDING_PICKUP,
    tenantId: null,
    address: {
      name: 'John Doe',
      mobile: '13800000000',
      province: 'Beijing',
      city: 'Beijing',
      district: 'Chaoyang',
      detail: 'No.1 Street',
    },
    items: [{ categoryId: 1, quantity: 1 }],
  };

  const mockJob = {
    id: 'job1',
    data: { orderId: '123' },
    name: 'dispatch-order',
  } as Job;

  const mockLogisticsIntegrationService = {
    createPickupOrder: jest.fn(),
  };

  const mockTenantService = {
    assignTenant: jest.fn(),
    getReceiptAddress: jest.fn(),
  };

  const mockSettlementService = {
    initSettlement: jest.fn(),
  };

  const mockOrderService = {
    findOne: jest.fn(),
    findLogisticsOrder: jest.fn(),
    saveDispatchResult: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchProcessor,
        {
          provide: LogisticsIntegrationService,
          useValue: mockLogisticsIntegrationService,
        },
        { provide: OrderService, useValue: mockOrderService },
        { provide: TenantService, useValue: mockTenantService },
        { provide: SettlementService, useValue: mockSettlementService },
      ],
    }).compile();

    processor = module.get<DispatchProcessor>(DispatchProcessor);
    jest.clearAllMocks();
  });

  it('should process dispatch order successfully', async () => {
    mockOrderService.findOne.mockResolvedValue(mockOrder);
    mockOrderService.findLogisticsOrder.mockResolvedValue(null);
    mockTenantService.assignTenant.mockResolvedValue({ id: 7 });
    mockTenantService.getReceiptAddress.mockResolvedValue({
      contactName: 'EcoRecycle Center',
      contactPhone: '13800138000',
      province: 'Beijing',
      city: 'Beijing',
      district: 'Haidian',
      detail: 'No.100 Road',
    });
    mockLogisticsIntegrationService.createPickupOrder.mockResolvedValue({
      logisticsNo: 'JD123456',
      logisticsCompany: 'JD',
      status: 'CREATED',
      providerData: {},
    });

    const result = await processor.handleDispatchOrder(mockJob);

    expect(mockOrderService.findOne).toHaveBeenCalledWith(123);
    expect(
      mockLogisticsIntegrationService.createPickupOrder,
    ).toHaveBeenCalled();
    expect(mockOrderService.saveDispatchResult).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({ logisticsNo: 'JD123456', status: 'CREATED' }),
    );
    expect(mockSettlementService.initSettlement).toHaveBeenCalledWith(
      123,
      7,
      10,
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
    expect(
      mockLogisticsIntegrationService.createPickupOrder,
    ).not.toHaveBeenCalled();
    expect(mockOrderService.saveDispatchResult).not.toHaveBeenCalled();
  });

  it('should handle order not found', async () => {
    mockOrderService.findOne.mockResolvedValue(null);

    await processor.handleDispatchOrder(mockJob);

    expect(
      mockLogisticsIntegrationService.createPickupOrder,
    ).not.toHaveBeenCalled();
  });

  it('should skip if order is not in dispatchable status', async () => {
    mockOrderService.findOne.mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.COMPLETED,
    });

    await processor.handleDispatchOrder(mockJob);

    expect(
      mockLogisticsIntegrationService.createPickupOrder,
    ).not.toHaveBeenCalled();
    expect(mockOrderService.saveDispatchResult).not.toHaveBeenCalled();
  });

  it('should throw error if logistics integration fails', async () => {
    mockOrderService.findOne.mockResolvedValue(mockOrder);
    mockOrderService.findLogisticsOrder.mockResolvedValue(null);
    mockTenantService.assignTenant.mockResolvedValue({ id: 7 });
    mockTenantService.getReceiptAddress.mockResolvedValue({
      province: 'Beijing',
      city: 'Beijing',
      district: 'Haidian',
      detail: 'No.100 Road',
      contactName: 'EcoRecycle Center',
      contactPhone: '13800138000',
    });
    mockLogisticsIntegrationService.createPickupOrder.mockRejectedValue(
      new Error('API Error'),
    );

    await expect(processor.handleDispatchOrder(mockJob)).rejects.toThrow(
      'API Error',
    );
  });
});
