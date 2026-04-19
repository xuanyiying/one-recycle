import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import Taro from '@tarojs/taro'
import { Storage } from '@/utils/storage'
import logger from '@/utils/logger'

// ============= 类型定义 =============

export interface User {
  id: string | number
  nickname: string
  avatar?: string
  phone?: string
  email?: string
  openid?: string
  unionid?: string
  [key: string]: any
}

export interface Order {
  id: string | number
  orderNo: string
  status: string
  totalAmount: number
  createdAt: string
  [key: string]: any
}

export interface AppState {
  // 用户信息
  user: User | null
  token: string | null

  // 订单数据
  orders: Order[]

  // UI 状态
  loading: boolean
  error: string | null

  // 性能优化：上次更新时间
  lastUpdateTime: number
}

// ============= Actions 类型定义 =============

export interface AppActions {
  // 用户相关
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void

  // 订单相关
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (orderId: string | number, updates: Partial<Order>) => void
  removeOrder: (orderId: string | number) => void

  // UI 状态
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // 批量操作
  login: (user: User, token: string) => void
  logout: () => void

  // 重置状态
  reset: () => void

  // 性能优化：更新时间戳
  touchUpdate: () => void
}

// ============= 初始状态 =============

const initialState: AppState = {
  user: null,
  token: null,
  orders: [],
  loading: false,
  error: null,
  lastUpdateTime: Date.now()
}

// ============= Storage 配置 =============

const storage = {
  getItem: (name: string): string | null => {
    try {
      return Taro.getStorageSync(name) || null
    } catch (error) {
      logger.error(`读取存储失败 (${name}):`, error)
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      Taro.setStorageSync(name, value)
    } catch (error) {
      logger.error(`写入存储失败 (${name}):`, error)
    }
  },
  removeItem: (name: string): void => {
    try {
      Taro.removeStorageSync(name)
    } catch (error) {
      logger.error(`删除存储失败 (${name}):`, error)
    }
  }
}

// ============= Store 创建 =============

type AppStore = AppState & AppActions

export const useStore = create<AppStore>()(
  persist(
    immer((set) => ({
      // 初始状态
      ...initialState,

      // ==================== 用户相关 Actions ====================

      setUser: (user) => set({ user, lastUpdateTime: Date.now() }),

      setToken: (token) => set({ token, lastUpdateTime: Date.now() }),

      updateUser: (updates) => set((state) => {
        if (state.user) {
          Object.assign(state.user, updates)
          state.lastUpdateTime = Date.now()
        }
      }),

      clearUser: () => set({ user: null, lastUpdateTime: Date.now() }),

      // ==================== 订单相关 Actions ====================

      setOrders: (orders) => set({ orders, lastUpdateTime: Date.now() }),

      addOrder: (order) => set((state) => {
        state.orders.unshift(order) // 新订单加到前面
        state.lastUpdateTime = Date.now()
      }),

      updateOrder: (orderId, updates) => set((state) => {
        const index = state.orders.findIndex(o => o.id === orderId)
        if (index !== -1) {
          const order = state.orders[index]
          if (order) {
            Object.assign(order, updates)
            state.lastUpdateTime = Date.now()
          }
        }
      }),

      removeOrder: (orderId) => set((state) => {
        state.orders = state.orders.filter(o => o.id !== orderId)
        state.lastUpdateTime = Date.now()
      }),

      // ==================== UI 状态 Actions ====================

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // ==================== 批量操作 Actions ====================

      login: (user, token) => set({
        user,
        token,
        error: null,
        lastUpdateTime: Date.now()
      }),

      logout: () => set({
        user: null,
        token: null,
        orders: [],
        error: null,
        lastUpdateTime: Date.now()
      }),

      // ==================== 重置状态 ====================

      reset: () => set(initialState),

      // ==================== 更新时间戳 ====================

      touchUpdate: () => set({ lastUpdateTime: Date.now() })
    })),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => storage),

      // 只持久化用户和订单相关数据，不持久化 UI 状态
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        orders: state.orders,
        lastUpdateTime: state.lastUpdateTime
      }),

      // 版本管理：数据迁移
      version: 1,

      migrate: (persistedState: any, version: number) => {
        // 从旧版本迁移数据
        if (version === 0) {
          // 迁移逻辑
          return {
            ...persistedState,
            lastUpdateTime: Date.now()
          }
        }
        return persistedState
      }
    }
  )
)

// ============= 便捷的 Hooks ====================

/**
 * 获取登录状态
 */
export const useIsLoggedIn = () => {
  const user = useStore((state) => state.user)
  const token = useStore((state) => state.token)
  return !!user && !!token
}

/**
 * 获取用户信息
 */
export const useUser = () => {
  return useStore((state) => state.user)
}

/**
 * 获取订单列表
 */
export const useOrders = () => {
  return useStore((state) => state.orders)
}

/**
 * 获取加载状态
 */
export const useLoading = () => {
  return useStore((state) => state.loading)
}

/**
 * 获取错误信息
 */
export const useError = () => {
  return useStore((state) => state.error)
}

/**
 * 获取 Store Actions
 */
export const useStoreActions = () => {
  return useStore((state) => ({
    setUser: state.setUser,
    setToken: state.setToken,
    updateUser: state.updateUser,
    clearUser: state.clearUser,
    setOrders: state.setOrders,
    addOrder: state.addOrder,
    updateOrder: state.updateOrder,
    removeOrder: state.removeOrder,
    setLoading: state.setLoading,
    setError: state.setError,
    login: state.login,
    logout: state.logout,
    reset: state.reset
  }))
}

// ============= 工具函数 ====================

/**
 * 从 Zustand store 迁移数据到新的 Zustand store
 * 用于从旧的 Context 迁移
 */
export const migrateFromLocalStorage = (): void => {
  try {
    const oldUser = Storage.getUser()
    const oldToken = Storage.getToken()
    const oldOrders = Storage.get('ORDERS')

    const store = useStore.getState()

    if (oldUser && !store.user) {
      store.setUser(oldUser)
    }

    if (oldToken && !store.token) {
      store.setToken(oldToken)
    }

    if (oldOrders && store.orders.length === 0) {
      store.setOrders(oldOrders)
    }

    // 清理旧数据
    Storage.remove('USER')
    Storage.remove('TOKEN')
    Storage.remove('ORDERS')

    logger.log('数据迁移完成')
  } catch (error) {
    logger.error('数据迁移失败:', error)
  }
}
