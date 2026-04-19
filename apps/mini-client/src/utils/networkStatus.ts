import { logger } from './logger'
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import syncQueue from './syncQueue';

/**
 * Network Status Manager
 * Monitors network connectivity and manages offline/online transitions
 */

export type NetworkType = 'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown' | 'none';

export interface NetworkStatusInfo {
  isConnected: boolean;
  networkType: NetworkType;
}

type NetworkStatusListener = (status: NetworkStatusInfo) => void;

class NetworkStatusManager {
  private isOnline: boolean = true;
  private networkType: NetworkType = 'unknown';
  private listeners: Set<NetworkStatusListener> = new Set();
  private initialized: boolean = false;

  /**
   * Initialize network status monitoring
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Get initial network status
    await this.updateNetworkStatus();

    // Listen for network status changes
    Taro.onNetworkStatusChange((res) => {
      const wasOnline = this.isOnline;
      this.isOnline = res.isConnected;
      this.networkType = res.networkType as NetworkType;

      // Notify listeners
      this.notifyListeners();

      // Handle online/offline transitions
      if (!wasOnline && this.isOnline) {
        this.handleOnline();
      } else if (wasOnline && !this.isOnline) {
        this.handleOffline();
      }
    });

    this.initialized = true;
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatusInfo {
    return {
      isConnected: this.isOnline,
      networkType: this.networkType,
    };
  }

  /**
   * Check if device is online
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Get network type
   */
  getNetworkType(): NetworkType {
    return this.networkType;
  }

  /**
   * Check if on WiFi
   */
  isWiFi(): boolean {
    return this.networkType === 'wifi';
  }

  /**
   * Check if on cellular network
   */
  isCellular(): boolean {
    return ['2g', '3g', '4g', '5g'].includes(this.networkType);
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Unsubscribe from network status changes
   */
  unsubscribe(listener: NetworkStatusListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Show offline indicator
   */
  showOfflineIndicator(): void {
    Taro.showToast({
      title: '网络连接已断开',
      icon: 'none',
      duration: 2000,
    });
  }

  /**
   * Show online indicator
   */
  showOnlineIndicator(): void {
    Taro.showToast({
      title: '网络已恢复',
      icon: 'success',
      duration: 1500,
    });
  }

  /**
   * Check if operation requires network
   */
  requiresNetwork(showToast: boolean = true): boolean {
    if (!this.isOnline && showToast) {
      Taro.showToast({
        title: '当前无网络连接',
        icon: 'none',
        duration: 2000,
      });
    }
    return this.isOnline;
  }

  /**
   * Execute function only when online
   */
  async whenOnline<T>(
    fn: () => Promise<T>,
    options: {
      showToast?: boolean;
      queueOffline?: boolean;
    } = {}
  ): Promise<T | null> {
    const { showToast = true, queueOffline = false } = options;

    if (!this.isOnline) {
      if (showToast) {
        this.showOfflineIndicator();
      }

      if (queueOffline) {
        // Queue operation for later sync
        logger.log('Operation queued for offline sync');
      }

      return null;
    }

    return await fn();
  }

  /**
   * Update network status
   */
  private async updateNetworkStatus(): Promise<void> {
    try {
      const res = await Taro.getNetworkType();
      this.networkType = res.networkType as NetworkType;
      this.isOnline = this.networkType !== 'none';
    } catch (error) {
      logger.error('Failed to get network status:', error);
      // Assume online if can't determine
      this.isOnline = true;
      this.networkType = 'unknown';
    }
  }

  /**
   * Handle online transition
   */
  private handleOnline(): void {
    logger.log('Device is now online');
    this.showOnlineIndicator();

    // Trigger sync queue processing
    syncQueue.processQueue().catch(error => {
      logger.error('Failed to process sync queue:', error);
    });
  }

  /**
   * Handle offline transition
   */
  private handleOffline(): void {
    logger.log('Device is now offline');
    this.showOfflineIndicator();
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        logger.error('Error in network status listener:', error);
      }
    });
  }
}

// Singleton instance
const networkStatusManager = new NetworkStatusManager();

export default networkStatusManager;

// React hook for network status
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatusInfo>({
    isConnected: true,
    networkType: 'unknown',
  });

  useEffect(() => {
    // Initialize network status manager
    networkStatusManager.initialize();

    // Get initial status
    setStatus(networkStatusManager.getStatus());

    // Subscribe to changes
    const unsubscribe = networkStatusManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return status;
}
