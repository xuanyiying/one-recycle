# Offline Capabilities Implementation

This document describes the offline capabilities implemented for the OneRecycle mini-program, including offline storage, sync queue, network status monitoring, and enhanced error handling.

## Overview

The offline capabilities system provides:

1. **Offline Storage**: Cache frequently accessed data for offline access
2. **Sync Queue**: Queue operations when offline and sync when connection is restored
3. **Network Status Monitoring**: Detect network changes and handle online/offline transitions
4. **Enhanced Error Handling**: Comprehensive error handling with retry logic and user-friendly messages

## Components

### 1. Offline Storage (`utils/offlineStorage.ts`)

Provides data caching with TTL (Time To Live) support using Taro's storage API.

#### Features
- Store data with configurable TTL
- Automatic cache expiration
- Cache invalidation
- Storage info and management

#### Usage

```typescript
import offlineStorage, { CacheKeys, CacheTTL } from './utils/offlineStorage';

// Save data
await offlineStorage.set(CacheKeys.USER_PROFILE, userData, {
  ttl: CacheTTL.LONG // 2 hours
});

// Retrieve data
const userData = await offlineStorage.get(CacheKeys.USER_PROFILE);

// Check if data exists
const hasData = await offlineStorage.has(CacheKeys.USER_PROFILE);

// Remove data
await offlineStorage.remove(CacheKeys.USER_PROFILE);

// Clear all offline data
await offlineStorage.clearAll();
```

#### Predefined Cache Keys
- `CATEGORIES`: Product categories
- `USER_PROFILE`: User profile data
- `RECENT_ORDERS`: Recent orders list
- `ADDRESSES`: User addresses
- `SETTINGS`: App settings

#### TTL Configurations
- `SHORT`: 5 minutes
- `MEDIUM`: 30 minutes
- `LONG`: 2 hours
- `DAY`: 24 hours
- `WEEK`: 7 days

### 2. Sync Queue (`utils/syncQueue.ts`)

Manages offline operations and syncs them when the device is back online.

#### Features
- Queue operations when offline
- Automatic sync when online
- Retry logic with exponential backoff
- Operation status tracking
- Conflict resolution support

#### Supported Operations
- `CREATE_ORDER`: Create new order
- `UPDATE_ORDER`: Update existing order
- `CANCEL_ORDER`: Cancel order
- `CREATE_ADDRESS`: Create new address
- `UPDATE_ADDRESS`: Update address
- `DELETE_ADDRESS`: Delete address
- `UPDATE_PROFILE`: Update user profile

#### Usage

```typescript
import syncQueue, { OperationType } from './utils/syncQueue';

// Add operation to queue
const operationId = await syncQueue.addOperation(
  OperationType.CREATE_ORDER,
  orderData
);

// Manually trigger sync
await syncQueue.processQueue();

// Get pending operations count
const pendingCount = syncQueue.getPendingCount();

// Retry failed operations
await syncQueue.retryFailed();

// Get queue status
const queue = syncQueue.getQueue();
```

### 3. Network Status Manager (`utils/networkStatus.ts`)

Monitors network connectivity and manages online/offline transitions.

#### Features
- Real-time network status monitoring
- Network type detection (WiFi, 2G, 3G, 4G, 5G)
- Subscribe to network changes
- Automatic sync trigger when back online
- User notifications for status changes

#### Usage

```typescript
import networkStatusManager, { useNetworkStatus } from './utils/networkStatus';

// Initialize (done automatically in app.tsx)
await networkStatusManager.initialize();

// Check if online
const isOnline = networkStatusManager.isConnected();

// Get network type
const networkType = networkStatusManager.getNetworkType();

// Subscribe to changes
const unsubscribe = networkStatusManager.subscribe((status) => {
  console.log('Network status:', status);
});

// Execute only when online
await networkStatusManager.whenOnline(async () => {
  // This code only runs when online
  return await apiCall();
});

// React hook
function MyComponent() {
  const networkStatus = useNetworkStatus();
  
  return (
    <div>
      {networkStatus.isConnected ? 'Online' : 'Offline'}
    </div>
  );
}
```

### 4. Error Handler (`utils/errorHandler.ts`)

Provides centralized error handling with user-friendly messages and retry logic.

#### Features
- Standardized error codes
- User-friendly error messages
- Automatic error classification
- Retry logic with exponential backoff
- Error logging and tracking

#### Error Categories
- **Network Errors**: Connection failures, timeouts
- **Authentication Errors**: Unauthorized, token expired
- **Validation Errors**: Invalid input, missing fields
- **Resource Errors**: Not found errors
- **Business Logic Errors**: Duplicate data, invalid operations
- **Server Errors**: Internal errors, service unavailable

#### Usage

```typescript
import errorHandler, { retryWithBackoff } from './utils/errorHandler';

// Handle error
try {
  await apiCall();
} catch (error) {
  const appError = errorHandler.handle(error, {
    showToast: true,
    logError: true,
  });
  
  console.log('Error code:', appError.code);
  console.log('Is retryable:', appError.retryable);
}

// Retry with backoff
const result = await retryWithBackoff(
  async () => {
    return await apiCall();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}`);
    }
  }
);
```

### 5. Offline Indicator Component (`components/OfflineIndicator`)

Visual indicator showing network status and pending sync operations.

#### Features
- Shows banner when offline
- Displays pending sync count
- Manual sync trigger button
- Auto-hide when back online

#### Usage

The component is automatically included in the app root (`app.tsx`):

```typescript
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  return (
    <AppProvider>
      <OfflineIndicator />
      {children}
    </AppProvider>
  );
}
```

## Integration with Services

### Enhanced Request Utility

The request utility (`utils/request.ts`) has been enhanced with:

1. **Network Status Check**: Verifies connection before making requests
2. **Error Handling**: Automatic error handling with user-friendly messages
3. **Retry Logic**: Configurable retry with exponential backoff
4. **Offline Detection**: Throws appropriate error when offline

```typescript
import { get, post } from './utils/request';

// GET request with retry
const data = await get('/api/orders', params, {
  retry: true,
  maxRetries: 3
});

// POST request (retry enabled by default)
const result = await post('/api/orders', orderData);
```

### Service Integration Example

Services can integrate offline storage for fallback data:

```typescript
class OrderService {
  async getOrders() {
    try {
      // Try API first
      const orders = await get('/api/orders');
      
      // Cache for offline access
      await offlineStorage.set(CacheKeys.RECENT_ORDERS, orders, {
        ttl: CacheTTL.MEDIUM
      });
      
      return orders;
    } catch (error) {
      // Fallback to cached data
      const cached = await offlineStorage.get(CacheKeys.RECENT_ORDERS);
      if (cached) {
        console.log('Using cached orders');
        return cached;
      }
      throw error;
    }
  }
}
```

## Workflow Examples

### Creating an Order (Offline-First)

```typescript
async function createOrder(orderData) {
  if (networkStatusManager.isConnected()) {
    // Online: Try to create immediately
    try {
      const order = await retryWithBackoff(
        () => orderService.createOrder(orderData),
        { maxRetries: 2 }
      );
      return order;
    } catch (error) {
      // Failed: Queue for later
      await syncQueue.addOperation(
        OperationType.CREATE_ORDER,
        orderData
      );
    }
  } else {
    // Offline: Queue immediately
    await syncQueue.addOperation(
      OperationType.CREATE_ORDER,
      orderData
    );
    networkStatusManager.showOfflineIndicator();
  }
}
```

### Fetching Data with Offline Fallback

```typescript
async function fetchUserProfile() {
  try {
    // Try API
    const profile = await accountService.getMyAccount();
    
    // Cache for offline
    await offlineStorage.set(
      CacheKeys.USER_PROFILE,
      profile,
      { ttl: CacheTTL.LONG }
    );
    
    return profile;
  } catch (error) {
    // Fallback to cache
    const cached = await offlineStorage.get(CacheKeys.USER_PROFILE);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
```

## Testing

### Manual Testing

1. **Offline Storage**:
   - Open app and navigate to profile
   - Turn off network
   - Refresh page - should show cached data
   - Wait for TTL to expire - should show no data

2. **Sync Queue**:
   - Turn off network
   - Create an order
   - Check that operation is queued
   - Turn on network
   - Verify order is created automatically

3. **Network Status**:
   - Toggle network on/off
   - Verify banner appears/disappears
   - Check that sync triggers when back online

4. **Error Handling**:
   - Trigger various errors (401, 404, 500)
   - Verify user-friendly messages
   - Check retry behavior

### Automated Testing

See `offlineCapabilities.example.ts` for usage examples that can be adapted into tests.

## Performance Considerations

1. **Storage Limits**: Mini-programs have storage limits (typically 10MB). Monitor storage usage with `offlineStorage.getInfo()`.

2. **Sync Queue Size**: Large queues can impact performance. Consider limiting queue size or implementing pagination.

3. **Network Checks**: Network status checks are lightweight but avoid excessive polling.

4. **Cache Invalidation**: Set appropriate TTLs to balance freshness and offline availability.

## Future Enhancements

1. **Conflict Resolution**: Implement sophisticated conflict resolution for synced data
2. **Partial Sync**: Support syncing specific operations or priorities
3. **Background Sync**: Use platform-specific background sync APIs
4. **Compression**: Compress cached data to save storage space
5. **Encryption**: Encrypt sensitive cached data
6. **Analytics**: Track offline usage patterns and sync success rates

## Troubleshooting

### Issue: Data not syncing when back online

**Solution**: Check that network status manager is initialized in `app.tsx` and sync queue is processing.

### Issue: Storage quota exceeded

**Solution**: Clear old cached data with `offlineStorage.clearAll()` or reduce TTLs.

### Issue: Operations failing after sync

**Solution**: Check operation data format and ensure backend APIs are compatible.

### Issue: Network status not updating

**Solution**: Verify that `networkStatusManager.initialize()` is called on app start.

## References

- [Taro Storage API](https://taro-docs.jd.com/docs/apis/storage/setStorage)
- [Taro Network API](https://taro-docs.jd.com/docs/apis/network/request)
- Design Document: `.kiro/specs/mini-program-optimization/design.md`
- Requirements: `.kiro/specs/mini-program-optimization/requirements.md`
