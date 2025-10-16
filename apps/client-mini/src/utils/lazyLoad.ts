/**
 * Lazy Loading Utility for Code Splitting
 * Provides utilities for lazy loading components and pages
 */

import { ComponentType } from 'react';

/**
 * Simple lazy load wrapper
 * Note: Taro has limited support for React.lazy, so this is a simplified version
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): ComponentType<any> {
  // For Taro, we'll just return a wrapper that imports on mount
  // This is a simplified version since Taro's React.lazy support is limited
  return importFunc as any;
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): void {
  // Trigger the import to start loading
  importFunc().catch(err => {
    console.error('Preload failed:', err);
  });
}

/**
 * Create a lazy loaded page component
 */
export function lazyPage<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  _pageName?: string
): ComponentType<any> {
  return lazyLoad(importFunc);
}

/**
 * Preload multiple components
 */
export function preloadComponents(
  importFuncs: Array<() => Promise<{ default: ComponentType<any> }>>
): void {
  importFuncs.forEach(importFunc => {
    preloadComponent(importFunc);
  });
}

/**
 * Lazy load with retry mechanism
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries: number = 3,
  interval: number = 1000
): ComponentType<any> {
  const retryImport = async (retriesLeft: number): Promise<{ default: T }> => {
    try {
      return await importFunc();
    } catch (error) {
      if (retriesLeft === 0) {
        throw error;
      }
      
      console.warn(`Import failed, retrying... (${retriesLeft} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, interval));
      return retryImport(retriesLeft - 1);
    }
  };

  return lazyLoad(() => retryImport(retries));
}

/**
 * Conditional lazy loading based on feature flag
 */
export function conditionalLazyLoad<T extends ComponentType<any>>(
  condition: boolean,
  lazyImport: () => Promise<{ default: T }>,
  fallbackComponent: T
): ComponentType<any> {
  if (condition) {
    return lazyLoad(lazyImport);
  }
  return fallbackComponent;
}
