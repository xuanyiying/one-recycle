/**
 * 图片预加载工具
 */

import Taro from "@tarojs/taro"

interface PreloadOptions {
  timeout?: number // 超时时间，默认10秒
  priority?: 'high' | 'low' // 优先级
}

/**
 * 预加载单张图片
 */
export const preloadImage = (src: string, options: PreloadOptions = {}): Promise<void> => {
  const { timeout = 10000, priority = 'low' } = options

  return new Promise((resolve, reject) => {
    // 在小程序环境中使用 Taro.downloadFile
    if (Taro.getSystemInfoSync().platform === 'weapp') {
      const downloadTask = Taro.downloadFile({
        url: src,
        success: () => resolve(),
        fail: (error: any) => reject(error)
      })

      // 设置超时
      setTimeout(() => {
        downloadTask.abort()
        reject(new Error(`Image preload timeout: ${src}`))
      }, timeout)

      return
    }

    // 在H5环境中使用Image对象
    const img = new Image()

    // 设置优先级
    if ('loading' in img) {
      img.loading = priority === 'high' ? 'eager' : 'lazy'
    }

    const timeoutId = setTimeout(() => {
      reject(new Error(`Image preload timeout: ${src}`))
    }, timeout)

    img.onload = () => {
      clearTimeout(timeoutId)
      resolve()
    }

    img.onerror = () => {
      clearTimeout(timeoutId)
      reject(new Error(`Failed to preload image: ${src}`))
    }

    img.src = src
  })
}

/**
 * 批量预加载图片
 */
export const preloadImages = async (
  urls: string[],
  options: PreloadOptions = {}
): Promise<{ success: string[], failed: string[] }> => {
  const results = await Promise.allSettled(
    urls.map(url => preloadImage(url, options))
  )

  const success: string[] = []
  const failed: string[] = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      success.push(urls[index])
    } else {
      failed.push(urls[index])
      console.warn(`Failed to preload image: ${urls[index]}`, result.reason)
    }
  })

  return { success, failed }
}

/**
 * 预加载关键图片（高优先级）
 */
export const preloadCriticalImages = (urls: string[]): Promise<{ success: string[], failed: string[] }> => {
  return preloadImages(urls, { priority: 'high', timeout: 5000 })
}

/**
 * 预加载非关键图片（低优先级）
 */
export const preloadNonCriticalImages = (urls: string[]): Promise<{ success: string[], failed: string[] }> => {
  return preloadImages(urls, { priority: 'low', timeout: 15000 })
}

/**
 * 图片缓存管理
 */
class ImageCache {
  private cache = new Map<string, boolean>()
  private maxSize = 100 // 最大缓存数量

  /**
   * 检查图片是否已缓存
   */
  has(url: string): boolean {
    return this.cache.has(url)
  }

  /**
   * 添加图片到缓存
   */
  add(url: string): void {
    // 如果缓存已满，删除最早的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(url, true)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }
}

export const imageCache = new ImageCache()

/**
 * 智能预加载：根据用户行为预测需要加载的图片
 */
export const smartPreload = (urls: string[], userBehavior: 'scroll' | 'hover' | 'click' = 'scroll') => {
  const delay = userBehavior === 'scroll' ? 100 : userBehavior === 'hover' ? 200 : 0

  setTimeout(() => {
    const uncachedUrls = urls.filter(url => !imageCache.has(url))
    if (uncachedUrls.length > 0) {
      preloadNonCriticalImages(uncachedUrls).then(({ success }) => {
        success.forEach(url => imageCache.add(url))
      })
    }
  }, delay)
}