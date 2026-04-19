import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { useAuth } from '../../hooks/useAuth'
import AuthGuard from '../../components/AuthGuard'
import ErrorBoundary from '../../components/ErrorBoundary'
import OrderCreationFlow from '../../components/OrderCreationFlow'
import { OrderStoreProvider } from '../../store/orderStore'
import { errorTracker } from '../../utils/errorTracker'
import './index.scss'

export default function RecycleForm() {
  const { isLoggedIn, loading, user } = useAuth()
  const router = useRouter()
  const [categoryId, setCategoryId] = useState<string>('')

  useEffect(() => {
    const nextCategoryId = router.params?.categoryId
    if (nextCategoryId) {
      setCategoryId(nextCategoryId)
    }
  }, [router.params?.categoryId])

  if (loading) {
    return <View className="loading">加载中...</View>
  }

  if (!isLoggedIn) {
    return (
      <View className="loading">
        正在跳转...
      </View>
    )
  }

  return (
    <AuthGuard>
      <View className="recycle-form-page">
        <OrderStoreProvider>
          <ErrorBoundary onError={(error) => errorTracker.captureError(error, 'render', { page: 'pages/recycle/index' })}>
            <OrderCreationFlow initialCategory={categoryId} userId={user?.id} />
          </ErrorBoundary>
        </OrderStoreProvider>
      </View>
    </AuthGuard>
  )
}
