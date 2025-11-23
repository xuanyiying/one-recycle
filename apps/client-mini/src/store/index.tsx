import { createContext, useContext, useReducer, ReactNode } from 'react'

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
    const [state, dispatch] = useReducer(appReducer, initialState)

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