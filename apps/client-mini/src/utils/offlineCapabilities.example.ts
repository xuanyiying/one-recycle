/**
 * Offline Capabilities Usage Examples
 * 
 * This file demonstrates how to use the offline storage, sync queue,
 * network status monitoring, and error handling utilities.
 */

import offlineStorage, { CacheKeys, CacheTTL } from './offlineStorage';
import syncQueue, { OperationType } from './syncQueue';
import networkStatusManager from './networkStatus';
import errorHandler, { retryWithBackoff } from './errorHandler';

// ============================================================================
// 1. OFFLINE STORAGE EXAMPLES
// ============================================================================

/**
 * Example: Cache user profile data
 */
async function cacheUserProfile() {
  const userProfile = {
    id: '123',
    nickname: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  // Save with default TTL (24 hours)
  await offlineStorage.set(CacheKeys.USER_PROFILE, userProfile);

  // Save with custom TTL (2 hours)
  await offlineStorage.set(CacheKeys.USER_PROFILE, userProfile, {
    ttl: CacheTTL.LONG,
  });
}

/**
 * Example: Retrieve cached data
 */
async function getCachedUserProfile() {
  // Get cached data (returns null if expired or doesn't exist)
  const profile = await offlineStorage.get(CacheKeys.USER_PROFILE);

  if (profile) {
    console.log('Using cached profile:', profile);
  } else {
    console.log('No cached profile available');
  }
}

/**
 * Example: Cache categories for offline access
 */
async function cacheCategories() {
  const categories = [
    { id: '1', name: '服装', icon: 'icon1.png' },
    { id: '2', name: '电子产品', icon: 'icon2.png' },
  ];

  // Cache for 1 week
  await offlineStorage.set(CacheKeys.CATEGORIES, categories, {
    ttl: CacheTTL.WEEK,
  });
}

/**
 * Example: Check if data exists and is valid
 */
async function checkCachedData() {
  const hasProfile = await offlineStorage.has(CacheKeys.USER_PROFILE);
  console.log('Has cached profile:', hasProfile);

  const age = await offlineStorage.getAge(CacheKeys.USER_PROFILE);
  if (age) {
    console.log(`Profile cached ${Math.floor(age / 1000)} seconds ago`);
  }
}

// ============================================================================
// 2. SYNC QUEUE EXAMPLES
// ============================================================================

/**
 * Example: Queue order creation for offline sync
 */
async function queueOrderCreation() {
  const orderData = {
    categoryId: '1',
    description: '旧衣服一批',
    images: ['image1.jpg', 'image2.jpg'],
    addressId: 'addr_123',
    scheduledTime: new Date().toISOString(),
  };

  // Add to sync queue
  const operationId = await syncQueue.addOperation(
    OperationType.CREATE_ORDER,
    orderData
  );

  console.log('Order queued for sync:', operationId);
}

/**
 * Example: Queue address update
 */
async function queueAddressUpdate() {
  const addressData = {
    id: 'addr_123',
    name: 'John Doe',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '测试地址123号',
  };

  await syncQueue.addOperation(OperationType.UPDATE_ADDRESS, addressData);
}

/**
 * Example: Manually trigger sync
 */
async function manualSync() {
  const pendingCount = syncQueue.getPendingCount();
  console.log(`${pendingCount} operations pending sync`);

  if (pendingCount > 0) {
    await syncQueue.processQueue();
    console.log('Sync completed');
  }
}

/**
 * Example: Retry failed operations
 */
async function retryFailedOperations() {
  await syncQueue.retryFailed();
}

/**
 * Example: Get queue status
 */
function getQueueStatus() {
  const queue = syncQueue.getQueue();
  const pending = syncQueue.getPendingCount();
  const syncing = syncQueue.isSyncInProgress();

  console.log('Queue status:', {
    totalOperations: queue.length,
    pendingOperations: pending,
    isSyncing: syncing,
  });
}

// ============================================================================
// 3. NETWORK STATUS EXAMPLES
// ============================================================================

/**
 * Example: Check network status
 */
function checkNetworkStatus() {
  const status = networkStatusManager.getStatus();
  console.log('Network status:', status);

  if (networkStatusManager.isConnected()) {
    console.log('Device is online');
  } else {
    console.log('Device is offline');
  }

  if (networkStatusManager.isWiFi()) {
    console.log('Connected via WiFi');
  } else if (networkStatusManager.isCellular()) {
    console.log('Connected via cellular network');
  }
}

/**
 * Example: Subscribe to network status changes
 */
function subscribeToNetworkChanges() {
  const unsubscribe = networkStatusManager.subscribe((status) => {
    console.log('Network status changed:', status);

    if (status.isConnected) {
      console.log('Back online! Syncing data...');
      syncQueue.processQueue();
    } else {
      console.log('Gone offline. Operations will be queued.');
    }
  });

  // Unsubscribe when no longer needed
  unsubscribe();
}

/**
 * Example: Execute function only when online
 */
async function executeWhenOnline() {
  const result = await networkStatusManager.whenOnline(
    async () => {
      // This will only execute if online
      return await fetch('https://api.example.com/data');
    },
    {
      showToast: true,
      queueOffline: true,
    }
  );

  if (result) {
    console.log('Operation completed:', result);
  } else {
    console.log('Operation queued for later (offline)');
  }
}

/**
 * Example: React hook for network status
 * 
 * Usage in a .tsx component file:
 * 
 * ```tsx
 * import { useNetworkStatus } from './networkStatus';
 * 
 * function NetworkStatusComponent() {
 *   const networkStatus = useNetworkStatus();
 * 
 *   return (
 *     <View>
 *       <Text>Connected: {networkStatus.isConnected ? 'Yes' : 'No'}</Text>
 *       <Text>Network Type: {networkStatus.networkType}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
function networkStatusComponentExample() {
  // This is a placeholder function to demonstrate the hook usage
  // See the comment above for actual implementation in a .tsx file
  console.log('See comment above for React component example');
}

// ============================================================================
// 4. ERROR HANDLING EXAMPLES
// ============================================================================

/**
 * Example: Handle API errors
 */
async function handleApiError() {
  try {
    // Make API call
    const response = await fetch('/api/orders');
    return response.json();
  } catch (error) {
    // Handle error with error handler
    const appError = errorHandler.handle(error, {
      showToast: true,
      logError: true,
    });

    console.log('Error code:', appError.code);
    console.log('Error message:', appError.message);
    console.log('Is retryable:', appError.retryable);

    if (appError.retryable) {
      console.log('This error can be retried');
    }

    throw appError;
  }
}

/**
 * Example: Retry with exponential backoff
 */
async function retryApiCall() {
  try {
    const result = await retryWithBackoff(
      async () => {
        // API call that might fail
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('API call failed');
        }
        return response.json();
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt}:`, error.message);
        },
      }
    );

    console.log('API call succeeded:', result);
    return result;
  } catch (error) {
    console.error('API call failed after retries:', error);
    throw error;
  }
}

/**
 * Example: Custom error handling
 */
async function customErrorHandling() {
  try {
    // Some operation
    throw new Error('Something went wrong');
  } catch (error) {
    const appError = errorHandler.handle(error, {
      showToast: false, // Don't show toast
      logError: true,
      onError: (err) => {
        // Custom error handling
        console.log('Custom error handler:', err);

        // Send to analytics
        // analytics.trackError(err);

        // Show custom UI
        // showCustomErrorDialog(err);
      },
    });

    throw appError;
  }
}

// ============================================================================
// 5. COMPLETE WORKFLOW EXAMPLE
// ============================================================================

/**
 * Example: Complete offline-first workflow for creating an order
 */
async function createOrderOfflineFirst() {
  // 1. Check network status
  const isOnline = networkStatusManager.isConnected();

  const orderData = {
    categoryId: '1',
    description: '旧衣服一批',
    images: ['image1.jpg', 'image2.jpg'],
    addressId: 'addr_123',
    scheduledTime: new Date().toISOString(),
  };

  if (isOnline) {
    // 2a. If online, try to create order immediately with retry
    try {
      const order = await retryWithBackoff(
        async () => {
          const response = await fetch('/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            throw new Error('Failed to create order');
          }

          return response.json();
        },
        {
          maxRetries: 2,
          initialDelay: 1000,
        }
      );

      console.log('Order created successfully:', order);

      // Cache the order for offline access
      await offlineStorage.set(`order_${order.id}`, order, {
        ttl: CacheTTL.DAY,
      });

      return order;
    } catch (error) {
      // 2b. If online but API fails, queue for later
      console.log('API failed, queuing order for sync');
      await syncQueue.addOperation(OperationType.CREATE_ORDER, orderData);

      errorHandler.handle(error, {
        showToast: true,
        onError: () => {
          console.log('Order will be created when connection is restored');
        },
      });
    }
  } else {
    // 3. If offline, queue immediately
    console.log('Offline, queuing order for sync');
    await syncQueue.addOperation(OperationType.CREATE_ORDER, orderData);

    networkStatusManager.showOfflineIndicator();
  }
}

/**
 * Example: Fetch data with offline fallback
 */
async function fetchDataWithOfflineFallback() {
  const cacheKey = CacheKeys.RECENT_ORDERS;

  try {
    // Try to fetch from API
    const orders = await retryWithBackoff(
      async () => {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        return response.json();
      },
      { maxRetries: 2 }
    );

    // Cache for offline access
    await offlineStorage.set(cacheKey, orders, { ttl: CacheTTL.MEDIUM });

    return orders;
  } catch (error) {
    // Fallback to cached data
    const cachedOrders = await offlineStorage.get(cacheKey);

    if (cachedOrders) {
      console.log('Using cached orders (offline mode)');
      return cachedOrders;
    }

    // No cached data available
    errorHandler.handle(error, {
      showToast: true,
      onError: () => {
        console.log('No cached data available');
      },
    });

    throw error;
  }
}

export {
  // Offline storage examples
  cacheUserProfile,
  getCachedUserProfile,
  cacheCategories,
  checkCachedData,

  // Sync queue examples
  queueOrderCreation,
  queueAddressUpdate,
  manualSync,
  retryFailedOperations,
  getQueueStatus,

  // Network status examples
  checkNetworkStatus,
  subscribeToNetworkChanges,
  executeWhenOnline,
  networkStatusComponentExample,

  // Error handling examples
  handleApiError,
  retryApiCall,
  customErrorHandling,

  // Complete workflow examples
  createOrderOfflineFirst,
  fetchDataWithOfflineFallback,
};
