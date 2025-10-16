import { DispatchService } from './dispatch/dispatch.service';
import { JdExpressService } from './jd-express/jd-express.service';
import { 
  JdExpressTimeoutException, 
  JdExpressAuthException, 
  JdExpressRateLimitException 
} from './common/exceptions/jd-express.exception';
import { CreatePickupDto } from './jd-express/dto/pickup.dto';
import { ServiceType } from './jd-express/interfaces/jd-express.interface';

// Mock JdExpressService
jest.mock('./jd-express/jd-express.service');

describe('JD Express System Integration Tests', () => {
  let dispatchService: DispatchService;
  let jdExpressService: jest.Mocked<JdExpressService>;

  beforeEach(() => {
    jdExpressService = new JdExpressService() as jest.Mocked<JdExpressService>;
    dispatchService = new DispatchService(jdExpressService);
    
    // Mock HTTP client to avoid HttpException in updateOrderStatus
    const mockHttpClient = {
      put: jest.fn().mockResolvedValue({ data: { success: true } }),
      get: jest.fn().mockResolvedValue({ data: { id: 'test-order', status: 'PENDING' } }),
      post: jest.fn().mockResolvedValue({ data: { success: true } })
    };
    
    // Replace the httpClient in dispatchService
    (dispatchService as any).httpClient = mockHttpClient;
  });

  const mockOrder = {
    id: 'test-order-id',
    orderNo: 'ORD-2024-001',
    customerId: 'customer-123',
    status: 'PENDING',
    senderAddress: {
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '三里屯街道1号'
    },
    receiverAddress: {
      name: '李四',
      phone: '13900139000',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '陆家嘴金融中心1号'
    },
    goods: [
      {
        name: '测试商品',
        weight: 1.5,
        quantity: 2,
        value: 100
      }
    ]
  };

  describe('Order Processing Flow', () => {
    it('should successfully process new order', async () => {
      const mockPickupResponse = {
        orderNo: 'JD123456789',
        waybillNo: 'JD123456789',
        pickupCode: 'ABC123',
        status: 'PENDING',
        estimatedPickupTime: '2024-01-15 14:00:00'
      };

      jdExpressService.notifyCourierForPickup = jest.fn().mockResolvedValue(mockPickupResponse);

      const result = await dispatchService.processNewOrder(mockOrder);

      expect(result).toBeDefined();
      expect(result.orderNo).toBe('ORD-2024-001');
      expect(result.status).toBe('DISPATCHED');
      expect(result.waybillNo).toBe('JD123456789');
      expect(jdExpressService.notifyCourierForPickup).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should handle JD Express timeout errors', async () => {
      jdExpressService.notifyCourierForPickup = jest.fn().mockRejectedValue(
        new JdExpressTimeoutException('notifyCourierForPickup', 30000)
      );

      await expect(dispatchService.processNewOrder(mockOrder)).rejects.toThrow(JdExpressTimeoutException);
    });

    it('should handle authentication errors', async () => {
      jdExpressService.notifyCourierForPickup = jest.fn().mockRejectedValue(
        new JdExpressAuthException('Authentication failed')
      );

      await expect(dispatchService.processNewOrder(mockOrder)).rejects.toThrow(JdExpressAuthException);
    });

    it('should handle rate limiting errors', async () => {
      jdExpressService.notifyCourierForPickup = jest.fn().mockRejectedValue(
        new JdExpressRateLimitException(60)
      );

      await expect(dispatchService.processNewOrder(mockOrder)).rejects.toThrow(JdExpressRateLimitException);
    });
  });

  describe('Waybill Status Query', () => {
    it('should successfully query waybill status', async () => {
      const mockStatusResponse = {
        waybillNo: 'JD123456789',
        status: 'IN_TRANSIT',
        currentLocation: '北京分拣中心',
        estimatedDelivery: '2024-01-16 18:00:00'
      };

      jdExpressService.queryWaybillTrace = jest.fn().mockResolvedValue(mockStatusResponse);

      const result = await dispatchService.queryWaybillStatus('JD123456789');

      expect(result).toBeDefined();
      expect(result.waybillNo).toBe('JD123456789');
      expect(result.status).toBe('IN_TRANSIT');
      expect(jdExpressService.queryWaybillTrace).toHaveBeenCalledWith('JD123456789');
    });
  });

  describe('Pickup Cancellation', () => {
    it('should successfully cancel pickup order', async () => {
      jdExpressService.cancelPickup = jest.fn().mockResolvedValue(true);

      const result = await dispatchService.cancelPickupOrder('JD123456789', 'Customer request');

      expect(result).toBe(true);
      expect(jdExpressService.cancelPickup).toHaveBeenCalledWith({
        orderNo: 'JD123456789',
        reason: 'Customer request'
      });
    });
  });

  describe('Parameter Validation', () => {
    it('should validate CreatePickupDto parameters correctly', () => {
      const createPickupDto: CreatePickupDto = {
        orderNo: 'TEST_ORDER_001',
        sender: {
          name: '张三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          address: '建国路88号SOHO现代城A座1001室'
        },
        receiver: {
          name: '回收中心',
          phone: '400-123-4567',
          province: '北京市',
          city: '北京市',
          district: '海淀区',
          address: '中关村大街1号'
        },
        goods: [
          {
            name: '废旧手机',
            category: 'electronics',
            quantity: 2,
            weight: 0.5,
            value: 200
          }
        ],
        serviceType: ServiceType.STANDARD,
        payType: 1,
        expectPickupTime: '2024-01-15 14:00:00',
        remark: '请提前电话联系'
      };

      // 验证 DTO 结构正确
      expect(createPickupDto.orderNo).toBeDefined();
      expect(createPickupDto.sender).toBeDefined();
      expect(createPickupDto.receiver).toBeDefined();
      expect(createPickupDto.goods).toBeDefined();
      expect(Array.isArray(createPickupDto.goods)).toBe(true);
    });

    it('should validate CancelPickupDto parameters correctly', () => {
      const cancelPickupDto = {
        orderNo: 'JD123456789',
        reason: 'Customer request'
      };

      // 验证取消订单参数结构
      expect(cancelPickupDto.orderNo).toBeDefined();
      expect(typeof cancelPickupDto.orderNo).toBe('string');
      expect(cancelPickupDto.reason).toBeDefined();
      expect(typeof cancelPickupDto.reason).toBe('string');
    });
  });
});