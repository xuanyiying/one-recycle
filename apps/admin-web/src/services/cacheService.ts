// 缓存服务
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // 过期时间（毫秒）
}

export interface CacheOptions {
  ttl?: number; // 生存时间（毫秒），默认5分钟
  maxSize?: number; // 最大缓存项数，默认100
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5分钟
  private maxSize = 100;

  constructor(options?: CacheOptions) {
    if (options?.ttl) {
      this.defaultTTL = options.ttl;
    }
    if (options?.maxSize) {
      this.maxSize = options.maxSize;
    }

    // 定期清理过期缓存
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // 每分钟清理一次
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = ttl || this.defaultTTL;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + expiry,
    };

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, item);
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // 可以添加命中率统计
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (now > item.expiry) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
  }

  /**
   * 获取最旧的缓存键
   */
  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  /**
   * 缓存装饰器 - 用于自动缓存异步函数结果
   */
  async withCache<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    // 先尝试从缓存获取
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中，执行获取函数
    try {
      const data = await fetcher();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      // 如果获取失败，不缓存错误结果
      throw error;
    }
  }

  /**
   * 批量删除匹配模式的缓存
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    Array.from(this.cache.keys()).forEach((key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });

    return keysToDelete.length;
  }

  /**
   * 刷新特定缓存
   */
  async refresh<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    // 删除现有缓存
    this.delete(key);

    // 重新获取并缓存
    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

// 创建全局缓存实例
export const cacheService = new CacheService({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 200, // 最大200个缓存项
});

// 预定义的缓存键
export const CACHE_KEYS = {
  // Dashboard
  DASHBOARD_STATS: 'dashboard:stats',
  DASHBOARD_CHARTS: 'dashboard:charts',

  // Couriers
  COURIERS_LIST: (params: string) => `couriers:list:${params}`,
  COURIER_DETAIL: (id: string) => `courier:detail:${id}`,
  COURIER_STATS: 'couriers:stats',
  COURIER_WORK_RECORDS: (id: string, params: string) => `courier:${id}:work_records:${params}`,
  COURIER_RATINGS: (id: string, params: string) => `courier:${id}:ratings:${params}`,

  // Notifications
  NOTIFICATIONS_LIST: (params: string) => `notifications:list:${params}`,
  NOTIFICATION_DETAIL: (id: string) => `notification:detail:${id}`,
  NOTIFICATION_STATS: 'notifications:stats',
  NOTIFICATION_TEMPLATES: (params: string) => `notification_templates:list:${params}`,

  // Settings
  USER_PROFILE: 'settings:user_profile',
  SYSTEM_SETTINGS: 'settings:system',
  NOTIFICATION_SETTINGS: 'settings:notifications',
  SECURITY_SETTINGS: 'settings:security',
  BACKUP_SETTINGS: 'settings:backup',
  BACKUP_RECORDS: (params: string) => `settings:backup_records:${params}`,
  SYSTEM_INFO: 'settings:system_info',

  // Users (for future use)
  USERS_LIST: (params: string) => `users:list:${params}`,
  USER_DETAIL: (id: string) => `user:detail:${id}`,

  // Orders (for future use)
  ORDERS_LIST: (params: string) => `orders:list:${params}`,
  ORDER_DETAIL: (id: string) => `order:detail:${id}`,

  // Inventory (for future use)
  INVENTORY_LIST: (params: string) => `inventory:list:${params}`,
  INVENTORY_ITEM: (id: string) => `inventory:item:${id}`,

  // Categories (for future use)
  CATEGORIES_LIST: (params: string) => `categories:list:${params}`,
  CATEGORY_DETAIL: (id: string) => `category:detail:${id}`,
};

// 缓存工具函数
export const cacheUtils = {
  /**
   * 生成查询参数的缓存键
   */
  generateParamsKey(params: Record<string, any>): string {
    return Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
  },

  /**
   * 清除特定模块的所有缓存
   */
  clearModuleCache(module: string): number {
    return cacheService.deletePattern(`^${module}:`);
  },

  /**
   * 清除所有列表缓存（通常在数据更新后调用）
   */
  clearListCaches(): number {
    return cacheService.deletePattern(':list:');
  },

  /**
   * 清除特定实体的相关缓存
   */
  clearEntityCache(entityType: string, entityId: string): number {
    return cacheService.deletePattern(`${entityType}.*${entityId}`);
  },
};

export default cacheService;
