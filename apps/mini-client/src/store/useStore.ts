import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import Taro from '@tarojs/taro'
import { Storage } from '@/utils/storage'
import { logger } from '@/utils/logger'
import type { User } from '@/types'

export interface AppOrder {
  id: string | number
  orderNo: string
  status: string
  totalAmount: number
  createdAt: string
  [key: string]: any
}

export interface AppState {
  user: User | null
  token: string | null
  orders: AppOrder[]
  loading: boolean
  error: string | null
  lastUpdateTime: number
}

export interface AppActions {
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  updateUser: (updates: Partial<User>) => void
  clearUser: () => void
  setOrders: (orders: AppOrder[]) => void
  addOrder: (order: AppOrder) => void
  updateOrder: (orderId: string | number, updates: Partial<AppOrder>) => void
  removeOrder: (orderId: string | number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
  reset: () => void
  touchUpdate: () => void
}

const initialState: AppState = {
  user: null,
  token: null,
  orders: [],
  loading: false,
  error: null,
  lastUpdateTime: Date.now()
}

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

type AppStore = AppState & AppActions

export const useStore = create<AppStore>()(
  persist(
    immer((set) => ({
      ...initialState,

      setUser: (user) => set({ user, lastUpdateTime: Date.now() }),

      setToken: (token) => set({ token, lastUpdateTime: Date.now() }),

      updateUser: (updates) => set((state) => {
        if (state.user) {
          Object.assign(state.user, updates)
          state.lastUpdateTime = Date.now()
        }
      }),

      clearUser: () => set({ user: null, lastUpdateTime: Date.now() }),

      setOrders: (orders) => set({ orders, lastUpdateTime: Date.now() }),

      addOrder: (order) => set((state) => {
        state.orders.unshift(order)
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

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

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

      reset: () => set(initialState),

      touchUpdate: () => set({ lastUpdateTime: Date.now() })
    })),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => storage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
        orders: state.orders,
        lastUpdateTime: state.lastUpdateTime
      }),

      version: 2,

      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            lastUpdateTime: Date.now()
          }
        }
        if (version === 1) {
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

export const useIsLoggedIn = () => {
  const user = useStore((state) => state.user)
  const token = useStore((state) => state.token)
  return !!user && !!token
}

export const useUser = () => {
  return useStore((state) => state.user)
}

export const useOrders = () => {
  return useStore((state) => state.orders)
}

export const useLoading = () => {
  return useStore((state) => state.loading)
}

export const useError = () => {
  return useStore((state) => state.error)
}

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

    Storage.remove('USER')
    Storage.remove('TOKEN')
    Storage.remove('ORDERS')

    logger.log('数据迁移完成')
  } catch (error) {
    logger.error('数据迁移失败:', error)
  }
}
