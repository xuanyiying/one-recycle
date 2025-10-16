/**
 * Optimistic Update Utility
 * Provides immediate UI feedback while API requests are in progress
 */

import Taro from '@tarojs/taro';

export interface OptimisticUpdateOptions<T, R = T> {
  // The optimistic data to show immediately
  optimisticData: T;
  // The actual API call to execute
  apiCall: () => Promise<R>;
  // Callback when API succeeds
  onSuccess?: (result: R) => void;
  // Callback when API fails (receives original data for rollback)
  onError?: (error: any, originalData: T) => void;
  // Success message to show
  successMessage?: string;
  // Error message to show
  errorMessage?: string;
}

/**
 * Execute an operation with optimistic update
 * Returns the optimistic data immediately and handles the API call in background
 */
export async function withOptimisticUpdate<T, R = T>(
  options: OptimisticUpdateOptions<T, R>
): Promise<{ optimistic: T; result: Promise<R> }> {
  const {
    optimisticData,
    apiCall,
    onSuccess,
    onError,
    successMessage,
    errorMessage
  } = options;

  // Return optimistic data immediately
  const resultPromise = apiCall()
    .then(result => {
      if (successMessage) {
        Taro.showToast({
          title: successMessage,
          icon: 'success',
          duration: 2000
        });
      }
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    })
    .catch(error => {
      console.error('Optimistic update failed:', error);
      
      if (errorMessage) {
        Taro.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        });
      }
      
      if (onError) {
        onError(error, optimisticData);
      }
      
      throw error;
    });

  return {
    optimistic: optimisticData,
    result: resultPromise
  };
}

/**
 * Optimistic list operations
 */
export class OptimisticList {
  /**
   * Add item to list optimistically
   */
  static async add<T extends { id: string | number }>(
    currentList: T[],
    newItem: T,
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
    }
  ): Promise<{ optimistic: T[]; result: Promise<T> }> {
    const optimisticList = [...currentList, newItem];

    const resultPromise = apiCall()
      .then(result => {
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      })
      .catch(error => {
        if (options?.onError) {
          options.onError(error);
        }
        throw error;
      });

    return {
      optimistic: optimisticList,
      result: resultPromise
    };
  }

  /**
   * Update item in list optimistically
   */
  static async update<T extends { id: string | number }>(
    currentList: T[],
    itemId: string | number,
    updates: Partial<T>,
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
    }
  ): Promise<{ optimistic: T[]; result: Promise<T> }> {
    const optimisticList = currentList.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    const resultPromise = apiCall()
      .then(result => {
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      })
      .catch(error => {
        if (options?.onError) {
          options.onError(error);
        }
        throw error;
      });

    return {
      optimistic: optimisticList,
      result: resultPromise
    };
  }

  /**
   * Remove item from list optimistically
   */
  static async remove<T extends { id: string | number }>(
    currentList: T[],
    itemId: string | number,
    apiCall: () => Promise<void>,
    options?: {
      onSuccess?: () => void;
      onError?: (error: any) => void;
    }
  ): Promise<{ optimistic: T[]; result: Promise<void> }> {
    const optimisticList = currentList.filter(item => item.id !== itemId);

    const resultPromise = apiCall()
      .then(() => {
        if (options?.onSuccess) {
          options.onSuccess();
        }
      })
      .catch(error => {
        if (options?.onError) {
          options.onError(error);
        }
        throw error;
      });

    return {
      optimistic: optimisticList,
      result: resultPromise
    };
  }
}

/**
 * Optimistic toggle utility (for boolean states)
 */
export async function optimisticToggle(
  currentValue: boolean,
  apiCall: () => Promise<boolean>,
  options?: {
    onSuccess?: (result: boolean) => void;
    onError?: (_error: any) => void;
  }
): Promise<{ optimistic: boolean; result: Promise<boolean> }> {
  const optimisticValue = !currentValue;

  const resultPromise = apiCall()
    .then(result => {
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      return result;
    })
    .catch(error => {
      if (options?.onError) {
        options.onError(error);
      }
      throw error;
    });

  return {
    optimistic: optimisticValue,
    result: resultPromise
  };
}
