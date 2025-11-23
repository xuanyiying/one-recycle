import { Suspense } from 'react'
import { View } from '@tarojs/components'
import { useAuth } from '../../hooks/useAuth'
import AuthGuard from '../../components/AuthGuard'
import OrderCreationFlow from '../../components/OrderCreationFlow/OrderCreationFlow'
import { OrderStoreProvider } from '../../store/orderStore'
import './index.scss'

/**
 * Recycle Page
 * Entry point for order creation that delegates to OrderCreationFlow
 * 
 * This page serves as the main entry point for users to create recycling orders.
 * It wraps the OrderCreationFlow component with authentication and state management.
 */
export default function RecycleForm() {
  const { isLoggedIn, requireAuth } = useAuth()

  // Require authentication before showing the form
  if (!isLoggedIn) {
    requireAuth()
    return null
  }

  return (
    <Suspense fallback={<View className="loading">加载中...</View>}>
      <AuthGuard>
        <View className='recycle-form-page'>
          <OrderStoreProvider>
            <OrderCreationFlow />
          </OrderStoreProvider>
        </View>
      </AuthGuard>
    </Suspense>
  )
}