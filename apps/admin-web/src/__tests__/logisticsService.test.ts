import { logisticsService, EXPRESS_COMPANIES } from '../services/logisticsService';
import { apiClient } from '../services/apiClient';

jest.mock('../services/apiClient');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('logisticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProviders', () => {
    it('should call the correct endpoint', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: '顺丰速运', code: 'SF', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await logisticsService.getProviders({ page: 1 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/logistics/providers', { page: 1 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createProvider', () => {
    it('should create a provider with correct data', async () => {
      const mockProvider = {
        id: 1,
        name: '顺丰速运',
        code: 'SF',
        apiUrl: 'https://api.sf-express.com',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApiClient.post.mockResolvedValue(mockProvider);

      const result = await logisticsService.createProvider({
        name: '顺丰速运',
        code: 'SF',
        apiUrl: 'https://api.sf-express.com',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/logistics/providers',
        {
          name: '顺丰速运',
          code: 'SF',
          apiUrl: 'https://api.sf-express.com',
        },
        {
          showSuccess: true,
          successMessage: '快递公司添加成功',
        }
      );
      expect(result).toEqual(mockProvider);
    });
  });

  describe('toggleProviderStatus', () => {
    it('should toggle provider status', async () => {
      const mockProvider = {
        id: 1,
        name: '顺丰速运',
        code: 'SF',
        isActive: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      mockApiClient.patch.mockResolvedValue(mockProvider);

      const result = await logisticsService.toggleProviderStatus(1, false);

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        '/logistics/providers/1/status',
        { isActive: false },
        {
          showSuccess: true,
          successMessage: '快递公司已禁用',
        }
      );
      expect(result).toEqual(mockProvider);
    });
  });

  describe('testConnection', () => {
    it('should test connection and return result', async () => {
      const mockResult = { success: true, message: '连接成功' };
      mockApiClient.post.mockResolvedValue(mockResult);

      const result = await logisticsService.testConnection(1);

      expect(mockApiClient.post).toHaveBeenCalledWith('/logistics/providers/1/test-connection');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getExpressCompanies', () => {
    it('should return predefined express companies', async () => {
      const result = await logisticsService.getExpressCompanies();
      expect(result).toEqual(EXPRESS_COMPANIES);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('EXPRESS_COMPANIES constant', () => {
    it('should contain major express companies', () => {
      const codes = EXPRESS_COMPANIES.map((c) => c.code);
      expect(codes).toContain('SF');
      expect(codes).toContain('JD');
      expect(codes).toContain('YTO');
      expect(codes).toContain('ZTO');
    });
  });
});
