import { expenseService, ExpenseType, ExpenseStatus } from '../services/expenseService';
import { apiClient } from '../services/apiClient';

jest.mock('../services/apiClient');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('expenseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExpenses', () => {
    it('should call the correct endpoint with params', async () => {
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await expenseService.getExpenses({
        page: 1,
        limit: 10,
        type: 'recycle_payment',
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/finance/expenses', {
        page: 1,
        limit: 10,
        type: 'recycle_payment',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getExpenseStats', () => {
    it('should call the correct endpoint', async () => {
      const mockStats = {
        totalExpense: 10000,
        recyclePaymentTotal: 8000,
        expressFeeTotal: 2000,
        todayExpense: 500,
        monthExpense: 3000,
        pendingCount: 5,
        completedCount: 100,
        trendData: [],
        categoryBreakdown: [],
      };
      mockApiClient.get.mockResolvedValue(mockStats);

      const result = await expenseService.getExpenseStats({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/finance/expenses/stats', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      expect(result).toEqual(mockStats);
    });
  });

  describe('exportExpenses', () => {
    it('should call export endpoint and return blob', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const mockResponse = { data: mockBlob };
      
      mockApiClient.getInstance.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await expenseService.exportExpenses({ type: 'recycle_payment' });

      expect(result).toBeInstanceOf(Blob);
    });
  });
});
