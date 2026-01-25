import apiClient from './apiClient';
import { cacheService, CACHE_KEYS } from './cacheService';

// 骑手状态枚举
export enum CourierStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

// 骑手接口
export interface Courier {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  licensePlate: string;
  status: CourierStatus;
  assignedOrders: number;
  completedOrders: number;
  registrationDate: string;
  avatar?: string;
  rating?: number;
  totalEarnings?: number;
  workingHours?: number;
}

// 骑手统计信息
export interface CourierStats {
  totalCouriers: number;
  availableCouriers: number;
  busyCouriers: number;
  offlineCouriers: number;
  averageRating: number;
  totalDeliveries: number;
  averageDeliveryTime: number;
}

// 骑手查询参数
export interface CourierQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CourierStatus;
  sortBy?: 'name' | 'registrationDate' | 'completedOrders' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// 骑手列表响应
export interface CourierListResponse {
  data: Courier[];
  total: number;
  page: number;
  pageSize: number;
}

// 创建骑手请求
export interface CreateCourierRequest {
  name: string;
  phone: string;
  idNumber: string;
  licensePlate: string;
  avatar?: string;
}

// 更新骑手请求
export interface UpdateCourierRequest {
  name?: string;
  phone?: string;
  idNumber?: string;
  licensePlate?: string;
  status?: CourierStatus;
  avatar?: string;
}

// 骑手工作记录
export interface CourierWorkRecord {
  id: string;
  courierId: string;
  orderId: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  earnings: number;
  distance: number;
  duration?: number;
}

// 骑手工作记录查询参数
export interface WorkRecordQueryParams {
  page?: number;
  pageSize?: number;
  courierId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'in_progress' | 'completed' | 'cancelled';
}

// 骑手工作记录列表响应
export interface WorkRecordListResponse {
  data: CourierWorkRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// 骑手评价
export interface CourierRating {
  id: string;
  courierId: string;
  orderId: string;
  customerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// 骑手评价查询参数
export interface RatingQueryParams {
  page?: number;
  pageSize?: number;
  courierId?: string;
  rating?: number;
  startDate?: string;
  endDate?: string;
}

// 骑手评价列表响应
export interface RatingListResponse {
  data: CourierRating[];
  total: number;
  page: number;
  pageSize: number;
}

// 骑手服务类
export class CourierService {
  // 获取骑手列表
  async getCouriers(
    params?: CourierQueryParams,
    useCache: boolean = true,
  ): Promise<CourierListResponse> {
    const cacheKey = `${CACHE_KEYS.COURIERS_LIST}:${JSON.stringify(params || {})}`;
    if (useCache) {
      return cacheService.withCache(
        cacheKey,
        () => this.fetchCouriers(params),
        2 * 60 * 1000, // 2分钟缓存
      );
    }
    return this.fetchCouriers(params);
  }

  private async fetchCouriers(params?: CourierQueryParams): Promise<CourierListResponse> {
    const response = await apiClient.get('/api/couriers', { params });
    return response.data;
  }

  // 获取骑手详情
  async getCourierById(id: string): Promise<Courier> {
    const response = await apiClient.get(`/api/couriers/${id}`);
    return response.data;
  }

  // 创建骑手
  async createCourier(data: CreateCourierRequest): Promise<Courier> {
    const response = await apiClient.post('/api/couriers', data);
    return response.data;
  }

  // 更新骑手
  async updateCourier(id: string, data: UpdateCourierRequest): Promise<Courier> {
    const response = await apiClient.put(`/api/couriers/${id}`, data);
    return response.data;
  }

  // 删除骑手
  async deleteCourier(id: string): Promise<void> {
    await apiClient.delete(`/api/couriers/${id}`);
  }

  // 更新骑手状态
  async updateCourierStatus(id: string, status: CourierStatus): Promise<Courier> {
    const response = await apiClient.patch(`/api/couriers/${id}/status`, { status });
    return response.data;
  }

  // 获取骑手统计信息
  async getCourierStats(useCache: boolean = true): Promise<CourierStats> {
    if (useCache) {
      return cacheService.withCache(
        CACHE_KEYS.COURIER_STATS,
        () => this.fetchCourierStats(),
        3 * 60 * 1000, // 3分钟缓存
      );
    }
    return this.fetchCourierStats();
  }

  private async fetchCourierStats(): Promise<CourierStats> {
    const response = await apiClient.get('/api/couriers/stats');
    return response.data;
  }

  // 获取骑手工作记录
  async getWorkRecords(params?: WorkRecordQueryParams): Promise<WorkRecordListResponse> {
    const response = await apiClient.get('/api/couriers/work-records', { params });
    return response.data;
  }

  // 获取骑手评价
  async getRatings(params?: RatingQueryParams): Promise<RatingListResponse> {
    const response = await apiClient.get('/api/couriers/ratings', { params });
    return response.data;
  }

  // 导出骑手数据
  async exportCouriers(params?: CourierQueryParams): Promise<Blob> {
    const response = await apiClient.get('/api/couriers/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // 批量更新骑手状态
  async batchUpdateStatus(courierIds: string[], status: CourierStatus): Promise<void> {
    await apiClient.patch('/api/couriers/batch-status', {
      courierIds,
      status,
    });
  }

  // 获取骑手绩效报告
  async getPerformanceReport(courierId: string, startDate: string, endDate: string): Promise<any> {
    const response = await apiClient.get(`/api/couriers/${courierId}/performance`, {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

// 导出服务实例
export const courierService = new CourierService();
