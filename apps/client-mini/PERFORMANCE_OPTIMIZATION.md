# Performance Optimization Implementation

This document describes the performance optimizations implemented for the OneRecycle mini-program.

## Overview

The performance optimization implementation includes:
1. Request caching and deduplication
2. Virtual scrolling for long lists
3. Code splitting and lazy loading
4. Performance monitoring and analytics

## 1. Request Optimization

### Request Cache (`src/utils/requestCache.ts`)

**Features:**
- TTL-based caching for GET requests
- Request deduplication to prevent duplicate API calls
- Pattern-based cache invalidation
- Automatic cleanup of expired entries

**Usage:**
```typescript
import { requestCache } from './utils/requestCache';

// Manual cache usage
const data = await requestCache.getOrFetch(
  'user-profile',
  () => fetchUserProfile(),
  5 * 60 * 1000 // 5 minutes TTL
);

// Invalidate cache by pattern
requestCache.invalidatePattern(/^\/order/);
```

**Integration:**
- Automatically integrated into `src/utils/request.ts`
- GET requests are cached by default
- Cache can be disabled per request: `get(url, params, { cache: false })`

### Debounce Utility (`src/utils/debounce.ts`)

**Features:**
- Standard debounce for delaying function execution
- Immediate execution option
- Async function support with promise handling

**Usage:**
```typescript
import { debounce, debounceAsync } from './utils/debounce';

// Debounce search input
const handleSearch = debounce((query: string) => {
  searchAPI(query);
}, 300);

// Async debounce
const handleAsyncSearch = debounceAsync(async (query: string) => {
  return await searchAPI(query);
}, 300);
```

### Throttle Utility (`src/utils/throttle.ts`)

**Features:**
- Standard throttle for limiting execution rate
- Leading and trailing edge options
- Request Animation Frame throttle for smooth animations
- Async function support

**Usage:**
```typescript
import { throttle, throttleRAF } from './utils/throttle';

// Throttle scroll event
const handleScroll = throttle((event) => {
  updateScrollPosition(event);
}, 100);

// RAF throttle for animations
const handleAnimation = throttleRAF(() => {
  updateAnimation();
});
```

### Optimistic Updates (`src/utils/optimisticUpdate.ts`)

**Features:**
- Immediate UI feedback while API requests are in progress
- Automatic rollback on error
- List operation helpers (add, update, remove)
- Toggle utility for boolean states

**Usage:**
```typescript
import { OptimisticList } from './utils/optimisticUpdate';

// Optimistic delete
const { optimistic, result } = await OptimisticList.remove(
  addresses,
  addressId,
  () => deleteAddress(addressId),
  {
    onSuccess: () => console.log('Deleted'),
    onError: (error) => console.error('Failed', error)
  }
);

// Update UI immediately with optimistic data
setAddresses(optimistic);

// Handle actual result
result.catch(() => {
  // Rollback on error
  setAddresses(addresses);
});
```

## 2. Virtual Scrolling

### Implementation

Virtual scrolling is implemented using Taro's `VirtualList` component for lists with more than 20 items.

**Updated Pages:**
- `src/pages/order/list/index.tsx` - Order list with virtual scrolling
- `src/pages/address/index.tsx` - Address list with virtual scrolling

**Features:**
- Automatic switching between regular and virtual lists based on item count
- Optimized rendering for long lists
- Maintains smooth scrolling performance

**Example:**
```typescript
const useVirtualList = filteredOrders.length > 20;

{useVirtualList ? (
  <VirtualList
    height="calc(100vh - 200rpx)"
    width="100%"
    itemData={filteredOrders}
    itemCount={filteredOrders.length}
    itemSize={280}
    item={({ data, index }) => renderOrderItem(data[index])}
  />
) : (
  <ScrollView>
    {filteredOrders.map(order => renderOrderItem(order))}
  </ScrollView>
)}
```

## 3. Code Splitting and Lazy Loading

### Lazy Load Utility (`src/utils/lazyLoad.ts`)

**Features:**
- Component lazy loading with loading fallback
- Error boundary for failed loads
- Retry mechanism for failed imports
- Preloading support
- Conditional lazy loading based on feature flags

**Usage:**
```typescript
import { lazyLoad, lazyPage, preloadComponent } from './utils/lazyLoad';

// Lazy load a component
const LazyComponent = lazyLoad(
  () => import('./MyComponent'),
  {
    fallback: <LoadingSpinner />,
    errorFallback: <ErrorMessage />
  }
);

// Lazy load a page
const LazyPage = lazyPage(
  () => import('./pages/settings/index'),
  '设置'
);

// Preload a component
preloadComponent(() => import('./pages/order/detail/index'));
```

### Page Preloading (`src/utils/preloadPages.ts`)

**Features:**
- Automatic preloading of critical pages on app launch
- Navigation-based preloading
- Intelligent preloading based on user behavior
- Preload queue with priority support

**Usage:**
```typescript
import { preloadCriticalPages, preloadRelatedPages } from './utils/preloadPages';

// Preload critical pages
preloadCriticalPages();

// Preload based on current page
preloadRelatedPages('/pages/index/index');
```

**Integration:**
- Automatically setup in `src/app.tsx`
- Preloads critical pages 2 seconds after app launch
- Preloads related pages on navigation

### Lazy Loaded Pages

The following non-critical pages have lazy-loaded wrappers:
- `src/pages/settings/index.lazy.tsx`
- `src/pages/agreement/index.lazy.tsx`
- `src/pages/pricing/index.lazy.tsx`

### Bundle Analysis

**Configuration:**
- `config/webpack.analyzer.js` - Webpack bundle analyzer configuration
- Optimized chunk splitting for vendors, common code, and UI libraries

**Scripts:**
```bash
# Analyze bundle size
npm run analyze

# Build and analyze
npm run build:analyze
```

**Analysis Script:**
- `scripts/analyze-bundle.js` - Custom bundle size analyzer
- Provides size breakdown and optimization recommendations
- Warns about large bundles (>2MB warning, >4MB error)

## 4. Performance Monitoring

### Performance Monitor (`src/utils/performanceMonitor.ts`)

**Features:**
- Page load time tracking
- API response time monitoring
- User interaction tracking
- Performance metrics export
- Analytics integration

**Metrics Tracked:**
- Page load times (average, slowest)
- API request durations (average, slowest, errors)
- User interaction counts
- Device performance info

**Usage:**
```typescript
import { performanceMonitor } from './utils/performanceMonitor';

// Track page load
performanceMonitor.trackPageLoad('/pages/order/list', startTime);

// Track API request (automatically integrated in request.ts)
performanceMonitor.trackAPIRequest(url, method, startTime, status);

// Track user interaction
performanceMonitor.trackInteraction('button_click', 'create_order');

// Get performance summary
const summary = performanceMonitor.getSummary();

// Export metrics
const metrics = performanceMonitor.exportMetrics();
```

**Integration:**
- Automatically tracks all API requests via `src/utils/request.ts`
- Sends metrics to analytics every 5 minutes in production
- Integrated in `src/app.tsx`

### Performance Dashboard (`src/components/PerformanceDashboard`)

**Features:**
- Real-time performance metrics display
- Development-only debugging tool
- Metrics refresh, clear, and export

**Usage:**
```typescript
import PerformanceDashboard from './components/PerformanceDashboard';

<PerformanceDashboard
  visible={showDashboard}
  onClose={() => setShowDashboard(false)}
/>
```

**Metrics Displayed:**
- Page load statistics
- API request statistics
- User interaction counts
- Color-coded warnings for slow operations

## Performance Targets

### Page Load Time
- **Target:** < 1 second
- **Warning:** > 1 second
- **Error:** > 2 seconds

### API Response Time
- **Target:** < 500ms
- **Warning:** > 500ms
- **Error:** > 1000ms

### Bundle Size
- **Target:** < 2MB
- **Warning:** > 2MB
- **Error:** > 4MB

## Best Practices

### 1. Request Optimization
- Use caching for frequently accessed data
- Implement debounce for search inputs
- Use throttle for scroll events
- Apply optimistic updates for better UX

### 2. Virtual Scrolling
- Enable for lists with > 20 items
- Set appropriate item size for accurate rendering
- Use memoized render functions

### 3. Code Splitting
- Lazy load non-critical pages
- Preload pages on navigation intent
- Use dynamic imports for large libraries
- Analyze bundle regularly

### 4. Performance Monitoring
- Track critical user journeys
- Monitor slow API requests
- Review metrics regularly
- Set up alerts for performance degradation

## Monitoring and Debugging

### Development Mode
1. Enable performance dashboard in development
2. Monitor console for slow operations
3. Use bundle analyzer to identify large chunks

### Production Mode
1. Metrics automatically sent to analytics
2. Monitor performance summary in backend
3. Set up alerts for performance issues

### Tools
- Bundle analyzer: `npm run build:analyze`
- Performance dashboard: Development only
- Console logs: Warnings for slow operations

## Future Improvements

1. **Service Worker**: Add offline caching for better performance
2. **Image Optimization**: Implement lazy loading for images
3. **Network Optimization**: Add request prioritization
4. **Memory Management**: Implement memory leak detection
5. **Advanced Analytics**: Add user session replay
6. **A/B Testing**: Test performance optimizations

## Troubleshooting

### Slow Page Loads
1. Check bundle size with analyzer
2. Review lazy loading implementation
3. Verify preloading is working
4. Check for blocking operations

### Slow API Requests
1. Review API response times in dashboard
2. Check network conditions
3. Verify caching is enabled
4. Consider request batching

### High Memory Usage
1. Check virtual list implementation
2. Review cache size limits
3. Clear old metrics regularly
4. Monitor component unmounting

## References

- [Taro Performance Optimization](https://taro-docs.jd.com/docs/optimized)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Performance](https://web.dev/performance/)
