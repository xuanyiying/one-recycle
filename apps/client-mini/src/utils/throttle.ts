/**
 * Throttle utility for limiting function execution rate
 * Useful for scroll events and other high-frequency events
 */

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  };
}

/**
 * Throttle with leading and trailing options
 */
export function throttleAdvanced<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;
  let lastArgs: Parameters<T> | null = null;

  const { leading = true, trailing = true } = options;

  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();

    if (!previous && !leading) {
      previous = now;
    }

    const remaining = limit - (now - previous);
    lastArgs = args;

    if (remaining <= 0 || remaining > limit) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
      lastArgs = null;
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timeout = null;
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };
}

/**
 * Throttle for async functions
 */
export function throttleAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => Promise<ReturnType<T> | void> {
  let inThrottle: boolean = false;
  let lastPromise: Promise<ReturnType<T>> | null = null;

  return async function executedFunction(...args: Parameters<T>): Promise<ReturnType<T> | void> {
    if (!inThrottle) {
      inThrottle = true;
      lastPromise = func(...args);
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);

      return lastPromise;
    }
    
    return lastPromise || Promise.resolve();
  };
}

/**
 * Request Animation Frame throttle for smooth animations
 */
export function throttleRAF<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func(...lastArgs);
        }
        rafId = null;
        lastArgs = null;
      });
    }
  };
}
