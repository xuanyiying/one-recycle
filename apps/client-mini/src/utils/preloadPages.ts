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
  // NOTE: Direct page preloading in Taro can cause "multiple Pages registered" error
  // disabling this for now.
  /*
  preloadComponents([
    () => import('../pages/order/detail/index'),
    () => import('../pages/order/index'),
  ]);
  */
}

/**
 * Preload pages based on current page
 */
export function preloadRelatedPages(currentPage: string) {
  // NOTE: Direct page preloading in Taro can cause "multiple Pages registered" error
  // disabling this for now.
  /*
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
  */
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
  private static history: string[] = [];
  
  static trackNavigation(path: string) {
    this.history.push(path);
    if (this.history.length > 10) {
      this.history.shift();
    }
    
    this.analyzeAndPreload();
  }
  
  private static analyzeAndPreload() {
    // Simple analysis: if user visits same sequence often, preload next step
    // Implementation skipped for MVP
  }
}
