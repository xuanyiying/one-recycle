import { Suspense, useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useAuth } from '../../hooks/useAuth'
import AuthGuard from '../../components/AuthGuard'
import OrderCreationFlow from '../../components/OrderCreationFlow/OrderCreationFlow'
import { OrderStoreProvider } from '../../store/orderStore'
import './index.scss'

export default function RecycleForm() {
  const { isLoggedIn, requireAuth } = useAuth()
  const router = useRouter()
  const [category, setCategory] = useState<string>('')

  useEffect(() => {
    if (router.params.category) {
      setCategory(router.params.category)
    }
  }, [router.params])

  // Move authentication check to side effect
  useEffect(() => {
    if (!isLoggedIn) {
      requireAuth()
    }
  }, [isLoggedIn, requireAuth])

  if (!isLoggedIn) {
    return null
  }

  return (
    <Suspense fallback={<View className="loading">加载中...</View>}>
      <AuthGuard>
        <View className='recycle-form-page'>
          <OrderStoreProvider>
            <OrderCreationFlow initialCategory={category} />
          </OrderStoreProvider>
        </View>
      </AuthGuard>
    </Suspense>
  )
}
