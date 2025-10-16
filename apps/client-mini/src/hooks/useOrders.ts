import { useState } from 'react'
import { useAppContext } from '../store'
import { getUserOrders, createOrder } from '../services/order'

// 订单 Hook
export const useOrders = () => {
    const { state, dispatch } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 获取用户订单
    const fetchOrders = async (userId: string) => {
        setLoading(true)
        setError(null)

        try {
            const orders = await getUserOrders(userId)

            // 更新全局状态
            dispatch({ type: 'SET_ORDERS', payload: orders })

            return orders
        } catch (err) {
            setError(err.message || '获取订单失败')
            throw err
        } finally {
            setLoading(false)
        }
    }

    // 创建订单
    const createNewOrder = async (orderData: any) => {
        setLoading(true)
        setError(null)

        try {
            const newOrder = await createOrder(orderData)

            // 更新全局状态中的订单列表
            const updatedOrders = [newOrder, ...state.orders]
            dispatch({ type: 'SET_ORDERS', payload: updatedOrders })

            return newOrder
        } catch (err) {
            setError(err.message || '创建订单失败')
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        orders: state.orders,
        loading,
        error,
        fetchOrders,
        createNewOrder
    }
}