import { dashboardApi } from '../services/dashboardApi';
import { notificationService } from '../services/notificationService';
import settingsService from '../services/settingsService';
import { apiClient } from '../services/apiClient';

jest.mock('../services/apiClient');
jest.mock('../services/orderService', () => ({
  orderService: {
    getOrderStats: jest.fn(),
    getRecentOrders: jest.fn(),
  },
}));
jest.mock('../services/userService', () => ({
  userService: {
    getUserStats: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('service contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('notificationService.getNotifications should pass plain query params', async () => {
    mockApiClient.get.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 10 } as any);

    await notificationService.getNotifications({ page: 1, pageSize: 10, search: 'abc' }, false);

    expect(mockApiClient.get).toHaveBeenCalledWith('/notifications', {
      page: 1,
      pageSize: 10,
      search: 'abc',
    });
  });

  it('notificationService.getTemplates should pass plain query params', async () => {
    mockApiClient.get.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 10 } as any);

    await notificationService.getTemplates({ page: 1, pageSize: 10, search: 'temp' });

    expect(mockApiClient.get).toHaveBeenCalledWith('/notifications/templates', {
      page: 1,
      pageSize: 10,
      search: 'temp',
    });
  });

  it('notificationService.batchDeleteNotifications should send ids as delete body', async () => {
    mockApiClient.delete.mockResolvedValue(undefined as any);

    await notificationService.batchDeleteNotifications(['n1', 'n2']);

    expect(mockApiClient.delete).toHaveBeenCalledWith('/notifications/batch', {
      notificationIds: ['n1', 'n2'],
    });
  });

  it('notificationService.exportNotifications should use axios instance for blob', async () => {
    const mockBlob = new Blob(['csv'], { type: 'text/csv' });
    const instanceGet = jest.fn().mockResolvedValue({ data: mockBlob });
    mockApiClient.getInstance.mockReturnValue({ get: instanceGet } as any);

    const result = await notificationService.exportNotifications({ page: 2 });

    expect(instanceGet).toHaveBeenCalledWith('/notifications/export', {
      params: { page: 2 },
      responseType: 'blob',
    });
    expect(result).toBe(mockBlob);
  });

  it('dashboardApi.getInventoryAlerts should return unwrapped array', async () => {
    const alerts = [{ id: 'a1', categoryName: '纸类', currentStock: 2, minStock: 5, status: 'low' }];
    mockApiClient.get.mockResolvedValue(alerts as any);

    const result = await dashboardApi.getInventoryAlerts(false);

    expect(result).toEqual(alerts);
  });

  it('settingsService.uploadFile should return direct api result', async () => {
    const uploadResult = { url: 'https://cdn.example.com/logo.png', filename: 'logo.png', size: 1234 };
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    mockApiClient.post.mockResolvedValue(uploadResult as any);

    const result = await settingsService.uploadFile(file, 'logo');

    expect(result).toEqual(uploadResult);
  });
});
