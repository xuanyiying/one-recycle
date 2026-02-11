import { cacheService, CACHE_KEYS } from './cacheService';
import { apiClient } from './apiClient';
import { orderService } from './orderService';
import { userService } from './userService';

// Dashboard data interfaces
export interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  totalUsers: number;
  activeUsers: number;
  pendingOrders: number;
  completedOrders: number;
  orderGrowth: number;
  revenueGrowth: number;
}

export interface RecentOrder {
  id: string;
  orderNo: string;
  customer: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface InventoryAlert {
  id: string;
  categoryName: string;
  currentStock: number;
  minStock: number;
  status: 'low' | 'out';
}

class DashboardApiService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(useCache: boolean = true): Promise<DashboardStats> {
    if (useCache) {
      return cacheService.withCache(
        CACHE_KEYS.DASHBOARD_STATS,
        () => this.fetchDashboardStats(),
        2 * 60 * 1000, // 2分钟缓存
      );
    }
    return this.fetchDashboardStats();
  }

  private async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const [orderStats, userStats] = await Promise.all([
        orderService.getOrderStats(),
        userService.getUserStats(),
      ]);

      // Combine data from different services
      const stats: DashboardStats = {
        totalOrders: orderStats.total || 0,
        todayOrders: 0, // Not available in OrderStats yet, assuming 0 or need to update OrderStats
        totalRevenue: 0, // Not available in OrderStats yet
        todayRevenue: orderStats.todayRevenue || 0,
        totalUsers: userStats.totalUsers || 0,
        activeUsers: userStats.activeUsers || 0,
        pendingOrders: orderStats.pending || 0,
        completedOrders: orderStats.completed || 0,
        orderGrowth: 0, // Not available
        revenueGrowth: 0, // Not available
      };
      
      // Update with actual fields if available or mapped correctly
      // Checking OrderStats interface:
      // total, pending, confirmed, inProgress, completed, cancelled, todayRevenue, monthlyRevenue
      // It seems some fields like orderGrowth are missing in OrderStats. 
      // I will map what is available and use defaults for others or I might need to update OrderStats.
      
      return {
        ...stats,
        totalOrders: orderStats.total,
        todayRevenue: orderStats.todayRevenue,
        pendingOrders: orderStats.pending,
        completedOrders: orderStats.completed,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * 获取最近订单
   */
  async getRecentOrders(limit: number = 5, useCache: boolean = true): Promise<RecentOrder[]> {
    const cacheKey = `dashboard:recent_orders:${limit}`;
    if (useCache) {
      return cacheService.withCache(
        cacheKey,
        () => this.fetchRecentOrders(limit),
        1 * 60 * 1000, // 1分钟缓存
      );
    }
    return this.fetchRecentOrders(limit);
  }

  private async fetchRecentOrders(limit: number): Promise<RecentOrder[]> {
    try {
      const orders = await orderService.getRecentOrders(limit);
      return orders.map(order => ({
        id: order.id.toString(),
        orderNo: order.orderNo,
        customer: order.address?.name || `用户#${order.userId}`,
        amount: order.settlementAmount || order.estimatedAmount || order.payAmount || 0,
        status: order.status as any,
        createdAt: order.createdAt
      }));
    } catch (error) {
      console.error('获取最近订单失败:', error);
      return [];
    }
  }

  /**
   * 获取库存警报
   */
  async getInventoryAlerts(useCache: boolean = true): Promise<InventoryAlert[]> {
    if (useCache) {
      return cacheService.withCache(
        'dashboard:inventory_alerts',
        () => this.fetchInventoryAlerts(),
        3 * 60 * 1000, // 3分钟缓存
      );
    }
    return this.fetchInventoryAlerts();
  }

  private async fetchInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
      const response = await apiClient.get('/inventory/alerts');
      return response.data || [];
    } catch (error) {
      console.error('获取库存警报失败:', error);
      return [];
    }
  }

  /**
   * 刷新所有仪表板数据
   */
  async refreshDashboardData(): Promise<{
    stats: DashboardStats;
    recentOrders: RecentOrder[];
    inventoryAlerts: InventoryAlert[];
  }> {
    try {
      // 清除相关缓存
      cacheService.delete(CACHE_KEYS.DASHBOARD_STATS);
      cacheService.deletePattern('dashboard:recent_orders:');
      cacheService.delete('dashboard:inventory_alerts');

      // 重新获取数据（不使用缓存）
      const [stats, recentOrders, inventoryAlerts] = await Promise.all([
        this.getDashboardStats(false),
        this.getRecentOrders(5, false),
        this.getInventoryAlerts(false),
      ]);

      return {
        stats,
        recentOrders,
        inventoryAlerts,
      };
    } catch (error) {
      console.error('刷新仪表板数据失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const dashboardApi = new DashboardApiService();
