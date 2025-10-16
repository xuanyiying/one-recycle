import apiClient from "./apiClient";

// 库存状态枚举
export enum InventoryStatus {
    AVAILABLE = 'AVAILABLE',
    LOW_STOCK = 'LOW_STOCK',
    OUT_OF_STOCK = 'OUT_OF_STOCK',
    RESERVED = 'RESERVED'
}

// 库存项目接口
export interface InventoryItem {
    id: string;
    categoryId: string;
    categoryName: string;
    unit: string;
    quantity: number;
    minThreshold: number;
    maxThreshold: number;
    currentPrice: number;
    lastUpdated: string;
    status: InventoryStatus;
    location?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// 库存统计接口
export interface InventoryStats {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    availableItems: number;
    reservedItems: number;
    categoriesCount: number;
    averagePrice: number;
}

// 库存查询参数接口
export interface InventoryQueryParams {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    categoryName?: string;
    status?: InventoryStatus;
    minQuantity?: number;
    maxQuantity?: number;
    sortBy?: 'categoryName' | 'quantity' | 'currentPrice' | 'lastUpdated' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

// 库存列表响应接口
export interface InventoryListResponse {
    items: InventoryItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// 创建库存项目请求接口
export interface CreateInventoryRequest {
    categoryId: string;
    quantity: number;
    minThreshold: number;
    maxThreshold: number;
    currentPrice: number;
    location?: string;
    notes?: string;
}

// 更新库存项目请求接口
export interface UpdateInventoryRequest {
    quantity?: number;
    minThreshold?: number;
    maxThreshold?: number;
    currentPrice?: number;
    location?: string;
    notes?: string;
}

// 库存调整记录接口
export interface InventoryAdjustment {
    id: string;
    inventoryId: string;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reason: string;
    operatorId: string;
    operatorName: string;
    createdAt: string;
}

// 库存调整请求接口
export interface InventoryAdjustmentRequest {
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reason: string;
}

// 库存预警接口
export interface InventoryAlert {
    id: string;
    inventoryId: string;
    categoryName: string;
    alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
    currentQuantity: number;
    threshold: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    isRead: boolean;
    createdAt: string;
}

// 库存服务类
export class InventoryService {
    /**
     * 获取库存列表
     */
    static async getInventoryItems(params: InventoryQueryParams = {}): Promise<InventoryListResponse> {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        return apiClient.get(`/inventory?${queryParams.toString()}`);
    }

    /**
     * 获取单个库存项目详情
     */
    static async getInventoryItem(id: string): Promise<InventoryItem> {
        return apiClient.get(`/inventory/${id}`);
    }

    /**
     * 创建库存项目
     */
    static async createInventoryItem(data: CreateInventoryRequest): Promise<InventoryItem> {
        return apiClient.post('/inventory', data);
    }

    /**
     * 更新库存项目
     */
    static async updateInventoryItem(id: string, data: UpdateInventoryRequest): Promise<InventoryItem> {
        return apiClient.put(`/inventory/${id}`, data);
    }

    /**
     * 删除库存项目
     */
    static async deleteInventoryItem(id: string): Promise<void> {
        return apiClient.delete(`/inventory/${id}`);
    }

    /**
     * 批量删除库存项目
     */
    static async batchDeleteInventoryItems(ids: string[]): Promise<void> {
        return apiClient.post('/inventory/batch-delete', { ids });
    }

    /**
     * 调整库存数量
     */
    static async adjustInventory(id: string, adjustment: InventoryAdjustmentRequest): Promise<InventoryItem> {
        return apiClient.post(`/inventory/${id}/adjust`, adjustment);
    }

    /**
     * 获取库存统计数据
     */
    static async getInventoryStats(): Promise<InventoryStats> {
        return apiClient.get('/inventory/stats');
    }

    /**
     * 获取库存调整记录
     */
    static async getInventoryAdjustments(inventoryId: string): Promise<InventoryAdjustment[]> {
        return apiClient.get(`/inventory/${inventoryId}/adjustments`);
    }

    /**
     * 获取库存预警列表
     */
    static async getInventoryAlerts(): Promise<InventoryAlert[]> {
        return apiClient.get('/inventory/alerts');
    }

    /**
     * 标记预警为已读
     */
    static async markAlertAsRead(alertId: string): Promise<void> {
        return apiClient.put(`/inventory/alerts/${alertId}/read`);
    }

    /**
     * 批量标记预警为已读
     */
    static async batchMarkAlertsAsRead(alertIds: string[]): Promise<void> {
        return apiClient.post('/inventory/alerts/batch-read', { alertIds });
    }

    /**
     * 导出库存数据
     */
    static async exportInventory(params: InventoryQueryParams = {}): Promise<Blob> {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        return apiClient.get(`/inventory/export?${queryParams.toString()}`, {
            responseType: 'blob'
        });
    }

    /**
     * 获取库存价值趋势
     */
    static async getInventoryValueTrend(days: number = 30): Promise<any[]> {
        return apiClient.get(`/inventory/value-trend?days=${days}`);
    }

    /**
     * 获取库存周转率
     */
    static async getInventoryTurnover(): Promise<any[]> {
        return apiClient.get('/inventory/turnover');
    }
}

// 导出服务实例
export const inventoryService = InventoryService;