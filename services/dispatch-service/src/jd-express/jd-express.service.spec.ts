import { JdExpressService } from './jd-express.service';
import { CreatePickupDto, CancelPickupDto } from './dto/pickup.dto';
import { ServiceType } from './interfaces/jd-express.interface';

// Mock axios
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxiosInstance),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  
  return {
    __esModule: true,
    default: mockAxios,
    ...mockAxios
  };
});

// Mock crypto
jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-hash'),
  })),
  randomBytes: jest.fn().mockReturnValue(Buffer.from('mocked-random-bytes')),
}));

describe('JdExpressService', () => {
  let service: JdExpressService;

  beforeEach(() => {
    // Mock environment variables
    process.env.JD_APP_KEY = 'test-app-key';
    process.env.JD_APP_SECRET = 'test-app-secret';
    process.env.JD_CUSTOMER_CODE = 'test-customer-code';
    process.env.JD_API_BASE_URL = 'https://api.jdl.com';
    process.env.JD_API_TIMEOUT = '30000';

    // Create service instance directly
    service = new JdExpressService();

    // Reset mocks
    jest.clearAllMocks();
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.get.mockClear();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.JD_APP_KEY;
    delete process.env.JD_APP_SECRET;
    delete process.env.JD_CUSTOMER_CODE;
    delete process.env.JD_API_BASE_URL;
    delete process.env.JD_API_TIMEOUT;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPickup', () => {
    it('should create pickup successfully', async () => {
      const createPickupDto: CreatePickupDto = {
        orderNo: 'TEST001',
        sender: {
          name: '张三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          address: '朝阳路123号'
        },
        receiver: {
          name: '李四',
          phone: '13900139000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          address: '浦东大道456号'
        },
        goods: [{
          name: '废纸',
          category: '可回收物',
          weight: 10,
          quantity: 1
        }],
        serviceType: ServiceType.STANDARD,
        payType: 1,
        expectPickupTime: '2024-01-01 10:00:00'
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            waybillNo: 'JD123456789',
            status: 'CREATED'
          }
        }
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await service.createPickup(createPickupDto);

      expect(result).toEqual({
        waybillNo: 'JD123456789',
        status: 'CREATED'
      });
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it('should handle API error', async () => {
      const createPickupDto: CreatePickupDto = {
        orderNo: 'TEST001',
        sender: {
          name: '张三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          address: '朝阳路123号'
        },
        receiver: {
          name: '李四',
          phone: '13900139000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          address: '浦东大道456号'
        },
        goods: [{
          name: '废纸',
          category: '可回收物',
          weight: 10,
          quantity: 1
        }],
        serviceType: ServiceType.STANDARD,
        payType: 1
      };

      const mockError = new Error('API Error');
      (mockError as any).response = {
        status: 400,
        data: {
          success: false,
          code: 'INVALID_PARAMS',
          message: 'Invalid parameters'
        }
      };

      mockAxiosInstance.post.mockRejectedValueOnce(mockError);

      await expect(service.createPickup(createPickupDto)).rejects.toThrow();
    });
  });

  describe('cancelPickup', () => {
    it('should cancel pickup successfully', async () => {
      const cancelPickupDto: CancelPickupDto = {
        orderNo: 'TEST001',
        reason: '用户取消'
      };

      const mockResponse = {
        data: {
          success: true,
          data: true
        }
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await service.cancelPickup(cancelPickupDto);

      expect(result).toBe(true);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPickupStatus', () => {
    it('should get pickup status successfully', async () => {
      const orderNo = 'TEST001';

      const mockResponse = {
        data: {
          success: true,
          data: {
            orderNo: 'TEST001',
            status: 'PICKED_UP',
            waybillNo: 'JD123456789'
          }
        }
      };

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getPickupStatus(orderNo);

      expect(result).toEqual({
        orderNo: 'TEST001',
        status: 'PICKED_UP',
        waybillNo: 'JD123456789'
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('queryWaybillTrace', () => {
    it('should query waybill trace successfully', async () => {
      const waybillNo = 'JD123456789';

      const mockResponse = {
        data: {
          success: true,
          data: {
            waybillNo: 'JD123456789',
            status: 'IN_TRANSIT',
            traces: [
              {
                time: '2024-01-01 10:00:00',
                location: '北京分拣中心',
                description: '包裹已发出'
              }
            ]
          }
        }
      };

      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await service.queryWaybillTrace(waybillNo);

      expect(result).toEqual({
        waybillNo: 'JD123456789',
        status: 'IN_TRANSIT',
        traces: [
          {
            time: '2024-01-01 10:00:00',
            location: '北京分拣中心',
            description: '包裹已发出'
          }
        ]
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('notifyCourierForPickup', () => {
    it('should notify courier for pickup successfully', async () => {
      const order = {
        orderNo: 'TEST001',
        user: {
          name: '张三',
          phone: '13800138000'
        },
        address: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '朝阳路123号',
          postcode: '100000'
        },
        items: [{
          category: {
            name: '废纸',
            code: 'PAPER'
          },
          estimatedWeight: 10,
          estimatedValue: 50,
          description: '废纸回收'
        }],
        expectPickupTime: '2024-01-01 10:00:00',
        remark: '请准时取件'
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            waybillNo: 'JD123456789',
            status: 'PICKUP_SCHEDULED',
            estimatedPickupTime: '2024-01-01 14:00:00'
          }
        }
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await service.notifyCourierForPickup(order);

      expect(result).toEqual({
        waybillNo: 'JD123456789',
        status: 'PICKUP_SCHEDULED',
        estimatedPickupTime: '2024-01-01 14:00:00'
      });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/pickup/create', expect.any(Object));
    });
  });
});