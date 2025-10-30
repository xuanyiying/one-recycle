/**
 * Page Preloading Utility
 * Preloads critical pages on navigation intent
 */

import Taro from '@tarojs/taro';
import { preloadComponents } from './lazyLoad';

/**
 * Preload critical pages based on user navigation patterns
 */
export function preloadCriticalPages() {
  // Preload order-related pages (high priority)
  preloadComponents([
    () => import('../pages/order/detail/index'),
    () => import('../pages/order/index'),
  ]);
}

/**
 * Preload pages based on current page
 */
export function preloadRelatedPages(currentPage: string) {
  const preloadMap: Record<string, Array<() => Promise<any>>> = {
    // From home page, preload recycle and order pages
    '/pages/index/index': [
      () => import('../pages/recycle/index'),
      () => import('../pages/order/index'),
      () => import('../pages/category/index'),
    ],
    
    // From recycle page, preload order confirmation
    '/pages/recycle/index': [
      () => import('../pages/order/confirm/index'),
      () => import('../pages/address/select/index'),
    ],
    
    // From order list, preload order detail
    '/pages/order/index': [
      () => import('../pages/order/detail/index'),
    ],
    
    // From profile, preload settings and address
    '/pages/profile/index': [
      () => import('../pages/settings/index'),
      () => import('../pages/address/index'),
      () => import('../pages/withdrawal/index'),
    ],
  };

  const pagesToPreload = preloadMap[currentPage];
  if (pagesToPreload) {
    preloadComponents(pagesToPreload);
  }
}

/**
 * Setup navigation preloading
 * Preloads pages when user shows intent to navigate
 */
export function setupNavigationPreload() {
  // Preload on app launch
  Taro.eventCenter.on('__taroRouterChange', (options: any) => {
    const { toLocation } = options;
    if (toLocation?.path) {
      // Preload related pages after a short delay
      setTimeout(() => {
        preloadRelatedPages(toLocation.path);
      }, 500);
    }
  });
}

/**
 * Preload page on hover/touch (for H5)
 */
export function preloadOnIntent(
  element: HTMLElement,
  importFunc: () => Promise<any>
) {
  let preloaded = false;

  const preload = () => {
    if (!preloaded) {
      preloaded = true;
      importFunc().catch(err => {
        console.error('Preload on intent failed:', err);
      });
    }
  };

  // Preload on mouseenter (desktop)
  element.addEventListener('mouseenter', preload, { once: true });
  
  // Preload on touchstart (mobile)
  element.addEventListener('touchstart', preload, { once: true, passive: true });
}

/**
 * Intelligent preloading based on user behavior
 */
export class IntelligentPreloader {
  private preloadQueue: Array<() => Promise<any>> = [];
  private isPreloading: boolean = false;

  /**
   * Add page to preload queue
   */
  addToQueue(importFunc: () => Promise<any>, priority: 'high' | 'low' = 'low') {
    if (priority === 'high') {
      this.preloadQueue.unshift(importFunc);
    } else {
      this.preloadQueue.push(importFunc);
    }
    this.processQueue();
  }

  /**
   * Process preload queue
   */
  private async processQueue() {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      return;
    }

    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      const importFunc = this.preloadQueue.shift();
      if (importFunc) {
        try {
          await importFunc();
          // Add small delay between preloads to avoid blocking
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Preload failed:', error);
        }
      }
    }

    this.isPreloading = false;
  }

  /**
   * Preload based on user's most visited pages
   */
  preloadFrequentPages(visitHistory: string[]) {
    // Get top 3 most visited pages
    const frequency: Record<string, number> = {};
    visitHistory.forEach(page => {
      frequency[page] = (frequency[page] || 0) + 1;
    });

    const topPages = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([page]) => page);

    // Preload these pages
    topPages.forEach(page => {
      preloadRelatedPages(page);
    });
  }
}

// Export singleton instance
export const intelligentPreloader = new IntelligentPreloader();
