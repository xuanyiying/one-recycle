import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import Taro from '@tarojs/taro'

// 定义状态类型
interface AppState {
    user: any | null
    token: string | null
    orders: any[]
}

// 定义动作类型
type Action =
    | { type: 'SET_USER'; payload: any }
    | { type: 'SET_TOKEN'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'SET_ORDERS'; payload: any[] }
    | { type: 'LOGIN'; payload: { user: any; token: string } }
    | { type: 'UPDATE_USER'; payload: any }

// 获取初始状态的辅助函数
const getInitialState = (): AppState => {
    try {
        const user = Taro.getStorageSync('user')
        const token = Taro.getStorageSync('token')
        return {
            user: user || null,
            token: token || null,
            orders: []
        }
    } catch (e) {
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
            return { ...state, user: action.payload }
        case 'SET_ORDERS':
            return { ...state, orders: action.payload }
        default:
            return state
    }
}

// Provider 组件
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(appReducer, getInitialState())

    // 监听 storage 变化（对于 mock 登录很重要，因为 MockAutoLogin 是在 App 组件中异步执行的）
    useEffect(() => {
        // 如果初始状态已经有了，就不需要轮询检查了
        if (state.user && state.token) return

        let count = 0
        let isMounted = true
        let timerId: ReturnType<typeof setTimeout> | null = null

        const checkStorageAsync = async () => {
            if (!isMounted) return

            try {
                // 使用异步方式获取，避免阻塞主线程，减少触发框架性能监控 Bug 的概率
                const { data: user } = await Taro.getStorage({ key: 'user' }).catch(() => ({ data: null }))
                const { data: token } = await Taro.getStorage({ key: 'token' }).catch(() => ({ data: null }))
                
                if (!isMounted) return

                if (user && token) {
                    if (!state.user || !state.token) {
                        dispatch({ type: 'LOGIN', payload: { user, token } })
                        return true
                    }
                }
            } catch (e) {
                // 忽略错误
            }
            return false
        }
        
        const poll = async () => {
            count++
            const found = await checkStorageAsync()
            
            if (!found && count < 10 && isMounted) {
                timerId = setTimeout(poll, 200)
            }
        }

        // 立即开始异步轮询
        poll()

        return () => {
            isMounted = false
            if (timerId) clearTimeout(timerId)
        }
    }, [state.user, state.token])

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