import Taro from '@tarojs/taro';

/**
 * Offline Storage Utility
 * Provides data caching for offline access with TTL support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface StorageInfo {
  keys: string[];
  currentSize: number;
  limitSize: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  forceRefresh?: boolean;
}

class OfflineStorage {
  private readonly STORAGE_PREFIX = 'offline_';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Save data to offline storage with TTL
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.DEFAULT_TTL } = options;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    try {
      await Taro.setStorage({
        key: this.getStorageKey(key),
        data: JSON.stringify(entry),
      });
    } catch (error) {
      console.error(`Failed to save offline data for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get data from offline storage
   * Returns null if data doesn't exist or has expired
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { forceRefresh = false } = options;

    if (forceRefresh) {
      return null;
    }

    try {
      const result = await Taro.getStorage({
        key: this.getStorageKey(key),
      });

      const entry: CacheEntry<T> = JSON.parse(result.data);

      // Check if data has expired
      if (Date.now() > entry.expiresAt) {
        await this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      // Data doesn't exist or error occurred
      return null;
    }
  }

  /**
   * Remove data from offline storage
   */
  async remove(key: string): Promise<void> {
    try {
      await Taro.removeStorage({
        key: this.getStorageKey(key),
      });
    } catch (error) {
      console.error(`Failed to remove offline data for key: ${key}`, error);
    }
  }

  /**
   * Clear all offline storage data
   */
  async clearAll(): Promise<void> {
    try {
      const storageInfo = await Taro.getStorageInfo() as unknown as StorageInfo;
      const keys = storageInfo.keys || [];
      const offlineKeys = keys.filter((key: string) => key.startsWith(this.STORAGE_PREFIX));

      await Promise.all(
        offlineKeys.map((key: string) => Taro.removeStorage({ key }))
      );
    } catch (error) {
      console.error('Failed to clear offline storage', error);
    }
  }

  /**
   * Get storage info (size, keys count)
   */
  async getInfo(): Promise<{
    keys: string[];
    currentSize: number;
    limitSize: number;
  }> {
    try {
      const info = await Taro.getStorageInfo() as unknown as StorageInfo;
      const keys = info.keys || [];
      const offlineKeys = keys.filter((key: string) => key.startsWith(this.STORAGE_PREFIX));

      return {
        keys: offlineKeys,
        currentSize: info.currentSize || 0,
        limitSize: info.limitSize || 0,
      };
    } catch (error) {
      console.error('Failed to get storage info', error);
      return {
        keys: [],
        currentSize: 0,
        limitSize: 0,
      };
    }
  }

  /**
   * Check if data exists and is valid
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Get data age in milliseconds
   */
  async getAge(key: string): Promise<number | null> {
    try {
      const result = await Taro.getStorage({
        key: this.getStorageKey(key),
      });

      const entry: CacheEntry<any> = JSON.parse(result.data);
      return Date.now() - entry.timestamp;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh TTL for existing data
   */
  async refresh(key: string, ttl?: number): Promise<boolean> {
    try {
      const result = await Taro.getStorage({
        key: this.getStorageKey(key),
      });

      const entry: CacheEntry<any> = JSON.parse(result.data);
      const newTtl = ttl || this.DEFAULT_TTL;

      entry.expiresAt = Date.now() + newTtl;

      await Taro.setStorage({
        key: this.getStorageKey(key),
        data: JSON.stringify(entry),
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  private getStorageKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }
}

// Singleton instance
const offlineStorage = new OfflineStorage();

// Predefined cache keys for frequently accessed data
export const CacheKeys = {
  CATEGORIES: 'categories',
  USER_PROFILE: 'user_profile',
  RECENT_ORDERS: 'recent_orders',
  ADDRESSES: 'addresses',
  SETTINGS: 'settings',
} as const;

// Cache TTL configurations (in milliseconds)
export const CacheTTL = {
  SHORT: 5 * 60 * 1000,        // 5 minutes
  MEDIUM: 30 * 60 * 1000,      // 30 minutes
  LONG: 2 * 60 * 60 * 1000,    // 2 hours
  DAY: 24 * 60 * 60 * 1000,    // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export default offlineStorage;
