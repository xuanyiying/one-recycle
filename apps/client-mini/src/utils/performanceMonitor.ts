/**
 * Performance Monitoring Utility
 * Tracks page load times, API response times, and user interactions
 */

import Taro from '@tarojs/taro';

interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

interface PageLoadMetric {
    page: string;
    loadTime: number;
    timestamp: number;
}

interface APIMetric {
    url: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
}

interface InteractionMetric {
    type: string;
    target: string;
    timestamp: number;
    metadata?: Record<string, any>;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private pageLoadMetrics: PageLoadMetric[] = [];
    private apiMetrics: APIMetric[] = [];
    private interactionMetrics: InteractionMetric[] = [];
    private maxMetrics: number = 100;

    /**
     * Track page load time
     */
    trackPageLoad(pagePath: string, startTime: number) {
        const loadTime = Date.now() - startTime;

        const metric: PageLoadMetric = {
            page: pagePath,
            loadTime,
            timestamp: Date.now()
        };

        this.pageLoadMetrics.push(metric);
        this.trimMetrics(this.pageLoadMetrics);

        // Log slow page loads
        if (loadTime > 1000) {
            console.warn(`Slow page load: ${pagePath} took ${loadTime}ms`);
        }

        // Store metric
        this.addMetric('page_load', loadTime, { page: pagePath });

        return loadTime;
    }

    /**
     * Track API request duration
     */
    trackAPIRequest(
        url: string,
        method: string,
        startTime: number,
        status: number
    ) {
        const duration = Date.now() - startTime;

        const metric: APIMetric = {
            url,
            method,
            duration,
            status,
            timestamp: Date.now()
        };

        this.apiMetrics.push(metric);
        this.trimMetrics(this.apiMetrics);

        // Log slow API requests
        if (duration > 500) {
            console.warn(`Slow API request: ${method} ${url} took ${duration}ms`);
        }

        // Store metric
        this.addMetric('api_request', duration, { url, method, status });

        return duration;
    }

    /**
     * Track user interaction
     */
    trackInteraction(type: string, target: string, metadata?: Record<string, any>) {
        const metric: InteractionMetric = {
            type,
            target,
            timestamp: Date.now(),
            metadata
        };

        this.interactionMetrics.push(metric);
        this.trimMetrics(this.interactionMetrics);

        this.addMetric('interaction', 1, { type, target, ...metadata });
    }

    /**
     * Add generic metric
     */
    private addMetric(name: string, value: number, metadata?: Record<string, any>) {
        const metric: PerformanceMetric = {
            name,
            value,
            timestamp: Date.now(),
            metadata
        };

        this.metrics.push(metric);
        this.trimMetrics(this.metrics);
    }

    /**
     * Trim metrics array to max size
     */
    private trimMetrics(metricsArray: any[]) {
        if (metricsArray.length > this.maxMetrics) {
            metricsArray.splice(0, metricsArray.length - this.maxMetrics);
        }
    }

    /**
     * Get average page load time
     */
    getAveragePageLoadTime(pagePath?: string): number {
        let metrics = this.pageLoadMetrics;

        if (pagePath) {
            metrics = metrics.filter(m => m.page === pagePath);
        }

        if (metrics.length === 0) return 0;

        const total = metrics.reduce((sum, m) => sum + m.loadTime, 0);
        return Math.round(total / metrics.length);
    }

    /**
     * Get average API response time
     */
    getAverageAPIResponseTime(url?: string): number {
        let metrics = this.apiMetrics;

        if (url) {
            metrics = metrics.filter(m => m.url.includes(url));
        }

        if (metrics.length === 0) return 0;

        const total = metrics.reduce((sum, m) => sum + m.duration, 0);
        return Math.round(total / metrics.length);
    }

    /**
     * Get slow API requests
     */
    getSlowAPIRequests(threshold: number = 500): APIMetric[] {
        return this.apiMetrics.filter(m => m.duration > threshold);
    }

    /**
     * Get performance summary
     */
    getSummary() {
        try {
            return {
                pageLoads: {
                    count: this.pageLoadMetrics.length,
                    average: this.getAveragePageLoadTime(),
                    slowest: Math.max(...this.pageLoadMetrics.map(m => m.loadTime), 0)
                },
                apiRequests: {
                    count: this.apiMetrics.length,
                    average: this.getAverageAPIResponseTime(),
                    slowest: Math.max(...this.apiMetrics.map(m => m.duration), 0),
                    errors: this.apiMetrics.filter(m => m.status >= 400).length
                },
                interactions: {
                    count: this.interactionMetrics.length
                }
            };
        } catch (error) {
            console.error('[PerformanceMonitor] Failed to get summary:', error);
            return {
                pageLoads: { count: 0, average: 0, slowest: 0 },
                apiRequests: { count: 0, average: 0, slowest: 0, errors: 0 },
                interactions: { count: 0 }
            };
        }
    }

    /**
     * Export metrics for analysis
     */
    exportMetrics() {
        try {
            return {
                pageLoads: this.pageLoadMetrics,
                apiRequests: this.apiMetrics,
                interactions: this.interactionMetrics,
                summary: this.getSummary()
            };
        } catch (error) {
            console.error('[PerformanceMonitor] Failed to export metrics:', error);
            return {
                pageLoads: [],
                apiRequests: [],
                interactions: [],
                summary: this.getSummary()
            };
        }
    }

    /**
     * Clear all metrics
     */
    clear() {
        this.metrics = [];
        this.pageLoadMetrics = [];
        this.apiMetrics = [];
        this.interactionMetrics = [];
    }

    /**
     * Send metrics to analytics service
     */
    async sendToAnalytics() {
        try {
            const summary = this.getSummary();

            // In production, send to your analytics service
            console.log('Performance Summary:', summary);
        } catch (error) {
            console.error('[PerformanceMonitor] Failed to send to analytics:', error);
        }
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Page load time tracker utility
 * Use this in componentDidMount to track page load time
 */
export function trackPageLoad(pageName: string, startTime: number) {
    performanceMonitor.trackPageLoad(pageName, startTime);
}

/**
 * Track component render time utility
 * Use this in componentDidMount to track render time
 */
export function trackComponentRender(componentName: string, startTime: number) {
    const renderTime = Date.now() - startTime;
    if (renderTime > 100) {
        console.warn(`Slow render: ${componentName} took ${renderTime}ms`);
    }
}

/**
 * Measure function execution time
 */
export async function measureExecutionTime<T>(
    name: string,
    fn: () => T | Promise<T>
): Promise<T> {
    const startTime = Date.now();

    try {
        const result = await fn();
        const duration = Date.now() - startTime;

        console.log(`[Performance] ${name}: ${duration}ms`);

        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[Performance] ${name} failed after ${duration}ms:`, error);
        throw error;
    }
}

/**
 * Get device performance info
 */
export function getDevicePerformance() {
  // 安全获取系统信息，避免在启动阶段出现空值
  const info = (() => { 
    try { 
      const systemInfo = Taro.getSystemInfoSync() as any;
      // 确保所有可能为 null 的属性都有默认值
      return {
        platform: systemInfo?.platform || '',
        system: systemInfo?.system || '',
        model: systemInfo?.model || '',
        brand: systemInfo?.brand || '',
        pixelRatio: systemInfo?.pixelRatio ?? 2,
        screenWidth: systemInfo?.screenWidth ?? 750,
        screenHeight: systemInfo?.screenHeight ?? 1334,
        windowWidth: systemInfo?.windowWidth ?? systemInfo?.screenWidth ?? 750,
        windowHeight: systemInfo?.windowHeight ?? systemInfo?.screenHeight ?? 1334,
        benchmarkLevel: systemInfo?.benchmarkLevel ?? 'unknown'
      };
    } catch { 
      return {
        platform: '',
        system: '',
        model: '',
        brand: '',
        pixelRatio: 2,
        screenWidth: 750,
        screenHeight: 1334,
        windowWidth: 750,
        windowHeight: 1334,
        benchmarkLevel: 'unknown'
      };
    } 
  })()

  return {
    platform: info.platform || '',
    system: info.system || '',
    model: info.model || '',
    pixelRatio: info.pixelRatio ?? 2,
    screenWidth: info.screenWidth ?? 750,
    screenHeight: info.screenHeight ?? 1334,
    windowWidth: info.windowWidth ?? info.screenWidth ?? 750,
    windowHeight: info.windowHeight ?? info.screenHeight ?? 1334,
    benchmarkLevel: info.benchmarkLevel ?? 'unknown'
  };
}

// Export class for testing
export { PerformanceMonitor };
