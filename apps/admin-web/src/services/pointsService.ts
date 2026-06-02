import { apiClient } from './apiClient';

export interface PointsStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  todayPointsIssued: number;
  topProducts: Array<{
    id: string;
    name: string;
    coverImage: string | null;
    points: number;
    soldCount: number;
  }>;
}

export interface PointsProduct {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  images: string[];
  type: 'VIRTUAL' | 'PHYSICAL';
  points: number;
  stock: number;
  soldCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
  categoryId: number | null;
  extraData: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PointsOrder {
  id: string;
  orderNo: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productType: 'VIRTUAL' | 'PHYSICAL';
  points: number;
  quantity: number;
  status: 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  addressId: string | null;
  addressSnapshot: Record<string, unknown> | null;
  logisticsNo: string | null;
  logisticsCompany: string | null;
  remark: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
    mobile: string | null;
  };
  product?: {
    id: string;
    name: string;
    coverImage: string | null;
  };
}

export interface CreateProductDto {
  name: string;
  description?: string;
  coverImage?: string;
  images?: string[];
  type?: 'VIRTUAL' | 'PHYSICAL';
  points: number;
  stock: number;
  status?: 'ACTIVE' | 'INACTIVE';
  sortOrder?: number;
  categoryId?: number;
  extraData?: Record<string, any>;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

export const pointsStatsApi = {
  /**
   * 获取统计概览
   */
  async getStats(): Promise<PointsStats> {
    return await apiClient.get('/admin/points/stats');
  },
};

export const pointsProductApi = {
  /**
   * 获取商品列表
   */
  async getProducts(params?: {
    page?: number;
    limit?: number;
    status?: 'ACTIVE' | 'INACTIVE';
    type?: 'VIRTUAL' | 'PHYSICAL';
    categoryId?: number;
  }) {
    return await apiClient.get('/admin/points/products', params);
  },

  /**
   * 获取商品详情
   */
  async getProduct(id: number) {
    return await apiClient.get(`/admin/points/products/${id}`);
  },

  /**
   * 创建商品
   */
  async createProduct(data: CreateProductDto) {
    return await apiClient.post('/admin/points/products', data);
  },

  /**
   * 更新商品
   */
  async updateProduct(id: number, data: UpdateProductDto) {
    return await apiClient.post(`/admin/points/products/${id}`, data);
  },

  /**
   * 删除商品
   */
  async deleteProduct(id: number) {
    return await apiClient.post(`/admin/points/products/${id}/delete`);
  },
};

export const pointsOrderApi = {
  /**
   * 获取订单列表
   */
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  }) {
    return await apiClient.get('/admin/points/orders', params);
  },

  /**
   * 获取订单详情
   */
  async getOrder(id: number) {
    return await apiClient.get(`/admin/points/orders/${id}`);
  },

  /**
   * 发货
   */
  async shipOrder(id: number, data: { logisticsNo: string; logisticsCompany: string }) {
    return await apiClient.post(`/admin/points/orders/${id}/ship`, data);
  },
};

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  type?: string;
  points?: number;
  icon?: string;
  config?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
}

export const pointsTaskApi = {
  async getTasks() {
    return await apiClient.get('/admin/points/tasks');
  },

  async createTask(data: {
    name: string;
    description?: string;
    type: string;
    points: number;
    icon?: string;
    config?: Record<string, unknown>;
    sortOrder?: number;
  }) {
    return await apiClient.post('/admin/points/tasks', data);
  },

  /**
   * 更新任务
   */
  async updateTask(id: number, data: UpdateTaskDto) {
    return await apiClient.post(`/admin/points/tasks/${id}`, data);
  },
};

export interface ReferralConfig {
  referralEnabled: boolean;
  rewardType: 'FIXED' | 'PERCENTAGE';
  rewardValue: number;
  rewardTiming: 'FIRST_ORDER' | 'EVERY_ORDER';
  minRewardPoints: number;
  inviteEnabled: boolean;
  inviteRewardType: 'FIXED' | 'PERCENTAGE';
  inviteRewardValue: number;
}

export const referralConfigApi = {
  async getConfig(): Promise<ReferralConfig> {
    const res = await apiClient.get('/admin/points/referral/config');
    return res.data || res;
  },

  async updateConfig(data: Partial<ReferralConfig>): Promise<ReferralConfig> {
    const res = await apiClient.post('/admin/points/referral/config', data);
    return res.data || res;
  },
};

