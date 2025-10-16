/**
 * Debounce utility for delaying function execution
 * Useful for search inputs and other user interactions
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Debounce with immediate execution option
 */
export function debounceImmediate<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const callNow = immediate && !timeout;

    const later = () => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Debounce for async functions with promise support
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let latestResolve: ((value: any) => void) | null = null;
  let latestReject: ((reason?: any) => void) | null = null;

  return function executedFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      if (timeout !== null) {
        clearTimeout(timeout);
        // Reject previous promise
        if (latestReject) {
          latestReject(new Error('Debounced'));
        }
      }

      latestResolve = resolve;
      latestReject = reject;

      timeout = setTimeout(async () => {
        timeout = null;
        try {
          const result = await func(...args);
          if (latestResolve) {
            latestResolve(result);
          }
        } catch (error) {
          if (latestReject) {
            latestReject(error);
          }
        }
      }, wait);
    });
  };
}
