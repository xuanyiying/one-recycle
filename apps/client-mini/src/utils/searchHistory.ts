import Taro from '@tarojs/taro'

export interface SearchHistoryItem {
  keyword: string
  timestamp: number
}

const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY_COUNT = 15 // 增加到15条，符合需求

// 防抖处理
let debounceTimer: NodeJS.Timeout | null = null
const DEBOUNCE_DELAY = 300 // 300ms防抖延迟

/**
 * 获取搜索历史
 */
export const getSearchHistory = (): SearchHistoryItem[] => {
  try {
    const historyStr = Taro.getStorageSync(SEARCH_HISTORY_KEY)
    if (!historyStr) return []
    
    const history: SearchHistoryItem[] = JSON.parse(historyStr)
    // 按时间戳倒序排列
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('获取搜索历史失败:', error)
    return []
  }
}

/**
 * 添加搜索历史（带防抖）
 */
export const addSearchHistory = (keyword: string): void => {
  try {
    if (!keyword.trim()) return
    
    const history = getSearchHistory()
    const existingIndex = history.findIndex(item => item.keyword === keyword.trim())
    
    // 如果已存在，先移除
    if (existingIndex > -1) {
      history.splice(existingIndex, 1)
    }
    
    // 添加到开头
    const newItem: SearchHistoryItem = {
      keyword: keyword.trim(),
      timestamp: Date.now()
    }
    
    history.unshift(newItem)
    
    // 限制历史记录数量
    if (history.length > MAX_HISTORY_COUNT) {
      history.splice(MAX_HISTORY_COUNT)
    }
    
    Taro.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('添加搜索历史失败:', error)
  }
}

/**
 * 带防抖的添加搜索历史
 */
export const addSearchHistoryDebounced = (keyword: string): void => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(() => {
    addSearchHistory(keyword)
  }, DEBOUNCE_DELAY)
}

/**
 * 删除单个搜索历史
 */
export const removeSearchHistory = (keyword: string): void => {
  try {
    const history = getSearchHistory()
    const filteredHistory = history.filter(item => item.keyword !== keyword)
    Taro.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory))
  } catch (error) {
    console.error('删除搜索历史失败:', error)
  }
}

/**
 * 清空搜索历史
 */
export const clearSearchHistory = (): void => {
  try {
    Taro.removeStorageSync(SEARCH_HISTORY_KEY)
  } catch (error) {
    console.error('清空搜索历史失败:', error)
  }
}

/**
 * 获取搜索发现数据（热门搜索）
 */
export const getSearchDiscoverData = (): SearchHistoryItem[] => {
  // 这里可以从API获取热门搜索数据，暂时返回静态数据
  const baseTimestamp = Date.now()
  return [
    {
      keyword: '手机回收',
      timestamp: baseTimestamp - 1000
    },
    {
      keyword: '笔记本电脑',
      timestamp: baseTimestamp - 2000
    },
    {
      keyword: '平板电脑',
      timestamp: baseTimestamp - 3000
    },
    {
      keyword: '数码相机',
      timestamp: baseTimestamp - 4000
    },
    {
      keyword: '智能手表',
      timestamp: baseTimestamp - 5000
    },
    {
      keyword: '游戏机',
      timestamp: baseTimestamp - 6000
    }
  ]
}

/**
 * 获取历史记录数量
 */
export const getSearchHistoryCount = (): number => {
  return getSearchHistory().length
}

/**
 * 检查是否达到最大历史记录数量
 */
export const isHistoryFull = (): boolean => {
  return getSearchHistoryCount() >= MAX_HISTORY_COUNT
}