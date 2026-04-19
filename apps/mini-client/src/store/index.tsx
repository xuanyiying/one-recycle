import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { User } from '@/types'
import { Storage, STORAGE_KEYS } from '@/utils/storage'
import { logger } from '@/utils/logger'

// 定义状态类型
interface AppState {
    user: User | null
    token: string | null
    orders: any[]
}

// 定义动作类型
type Action =
    | { type: 'SET_USER'; payload: User }
    | { type: 'SET_TOKEN'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'SET_ORDERS'; payload: any[] }
    | { type: 'LOGIN'; payload: { user: User; token: string } }
    | { type: 'UPDATE_USER'; payload: Partial<User> }

// 获取初始状态的辅助函数
const getInitialState = (): AppState => {
    try {
        let user: User | null = null
        let token: string | null = null

        // 安全地获取用户数据
        try {
            const userData = Storage.getUser()
            if (userData && typeof userData === 'object' && userData.id) {
                user = userData as User
            } else if (userData) {
                // 数据格式不正确，清除缓存
                logger.warn('用户数据格式不正确，清除缓存')
                Storage.remove('USER')
            }
        } catch (e) {
            logger.warn('用户数据解析失败，清除缓存:', e)
            try {
                Storage.remove('USER')
            } catch (removeError) {
                logger.error('清除用户数据失败:', removeError)
            }
        }

        // 安全地获取 Token
        try {
            const tokenData = Storage.getToken()
            if (typeof tokenData === 'string' && tokenData.length > 0) {
                token = tokenData
            } else if (tokenData) {
                // Token 格式不正确，清除缓存
                logger.warn('Token 格式不正确，清除缓存')
                Storage.remove('TOKEN')
            }
        } catch (e) {
            logger.warn('Token 解析失败，清除缓存:', e)
            try {
                Storage.remove('TOKEN')
            } catch (removeError) {
                logger.error('清除 Token 失败:', removeError)
            }
        }

        return {
            user,
            token,
            orders: []
        }
    } catch (e) {
        logger.error('获取初始状态失败:', e)
        return {
            user: null,
            token: null,
            orders: []
        }
    }
}

// 初始状态
const initialState: AppState = {
    user: null,
    token: null,
    orders: []
}

// 创建 Context
export const AppContext = createContext<{
    state: AppState
    dispatch: React.Dispatch<Action>
}>({
    state: initialState,
    dispatch: () => null
})

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload }
        case 'SET_TOKEN':
            return { ...state, token: action.payload }
        case 'LOGIN':
            return { ...state, user: action.payload.user, token: action.payload.token }
        case 'LOGOUT':
            return { ...initialState }
        case 'UPDATE_USER':
            return { ...state, user: state.user ? { ...state.user, ...action.payload } : null }
        case 'SET_ORDERS':
            return { ...state, orders: action.payload }
        default:
            return state
    }
}

// Provider 组件
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(appReducer, getInitialState())

    // 监听 storage 变化（对于多标签页同步很重要，仅 H5 有效）
    useEffect(() => {
        // H5 环境下的多标签页同步
        if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
            const handleStorageChange = (e: StorageEvent) => {
                if (e.key === STORAGE_KEYS.USER || e.key === STORAGE_KEYS.TOKEN) {
                    if (!e.newValue) {
                        // 另一个标签页登出了
                        dispatch({ type: 'LOGOUT' })
                    } else if (e.key === STORAGE_KEYS.USER) {
                        try {
                            const user = JSON.parse(e.newValue)
                            const token = Storage.getToken()
                            if (token) {
                                dispatch({ type: 'LOGIN', payload: { user, token } })
                            }
                        } catch (err) {
                            logger.error('解析 storage 用户信息失败:', err)
                        }
                    }
                }
            }
            window.addEventListener('storage', handleStorageChange)
            return () => window.removeEventListener('storage', handleStorageChange)
        }
    }, [dispatch])

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    )
}

// 自定义 Hook
export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider')
    }
    return context
}

// 导出订单创建流相关的 store
export * from './orderStore'