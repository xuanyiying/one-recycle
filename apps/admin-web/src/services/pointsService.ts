import { apiClient } from './apiClient';

export interface PointsStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  todayPointsIssued: number;
  topProducts: Array<{
    id: bigint;
    name: string;
    coverImage: string | null;
    points: number;
    soldCount: number;
  }>;
}

export interface PointsProduct {
  id: bigint;
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
  id: bigint;
  orderNo: string;
  userId: bigint;
  productId: bigint;
  productName: string;
  productImage: string | null;
  productType: 'VIRTUAL' | 'PHYSICAL';
  points: number;
  quantity: number;
  status: 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  addressId: bigint | null;
  addressSnapshot: any;
  logisticsNo: string | null;
  logisticsCompany: string | null;
  remark: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: bigint;
    nickname: string | null;
    avatarUrl: string | null;
    mobile: string | null;
  };
  product?: {
    id: bigint;
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
    const response = await apiClient.get('/admin/points/stats');
    return response.data;
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
    const response = await apiClient.get('/admin/points/products', params);
    return response.data;
  },

  /**
   * 获取商品详情
   */
  async getProduct(id: number) {
    const response = await apiClient.get(`/admin/points/products/${id}`);
    return response.data;
  },

  /**
   * 创建商品
   */
  async createProduct(data: CreateProductDto) {
    const response = await apiClient.post('/admin/points/products', data);
    return response.data;
  },

  /**
   * 更新商品
   */
  async updateProduct(id: number, data: UpdateProductDto) {
    const response = await apiClient.post(`/admin/points/products/${id}`, data);
    return response.data;
  },

  /**
   * 删除商品
   */
  async deleteProduct(id: number) {
    const response = await apiClient.post(`/admin/points/products/${id}/delete`);
    return response.data;
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
    const response = await apiClient.get('/admin/points/orders', params);
    return response.data;
  },

  /**
   * 获取订单详情
   */
  async getOrder(id: number) {
    const response = await apiClient.get(`/admin/points/orders/${id}`);
    return response.data;
  },

  /**
   * 发货
   */
  async shipOrder(id: number, data: { logisticsNo: string; logisticsCompany: string }) {
    const response = await apiClient.post(`/admin/points/orders/${id}/ship`, data);
    return response.data;
  },
};

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  type?: string;
  points?: number;
  icon?: string;
  config?: any;
  sortOrder?: number;
  isActive?: boolean;
}

export const pointsTaskApi = {
  /**
   * 获取任务列表
   */
  async getTasks() {
    const response = await apiClient.get('/admin/points/tasks');
    return response.data;
  },

  /**
   * 创建任务
   */
  async createTask(data: {
    name: string;
    description?: string;
    type: string;
    points: number;
    icon?: string;
    config?: any;
    sortOrder?: number;
  }) {
    const response = await apiClient.post('/admin/points/tasks', data);
    return response.data;
  },

  /**
   * 更新任务
   */
  async updateTask(id: number, data: UpdateTaskDto) {
    const response = await apiClient.post(`/admin/points/tasks/${id}`, data);
    return response.data;
  },
};

