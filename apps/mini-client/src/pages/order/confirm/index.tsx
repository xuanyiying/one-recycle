import { logger } from '@/utils/logger'
import { useState, useEffect, useCallback } from 'react'
import { View, Text, Button, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Divider } from '@nutui/nutui-react-taro'
import { useAuth } from '@/hooks/useAuth'
import { createOrder } from '@/services/order'
import { Icon } from '@/components/Icon'
import './index.scss'

interface OrderData {
  category: string
  description: string
  weight: string
  images: string[]
  pickupAddress: string
  pickupTime: string
  contactPhone: string
  remarks: string
  estimatedPrice: number
}

export default function OrderConfirm() {
  const router = useRouter()
  const { user } = useAuth()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { data } = router.params
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data))
        setOrderData(parsedData)
      } catch (error) {
        logger.error('解析订单数据失败:', error)
        Taro.showToast({
          title: '数据解析失败',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } else {
      Taro.showToast({
        title: '订单数据缺失',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }, [router.params])

  const handleSubmitOrder = useCallback(async () => {
    if (loading) return

    if (!orderData || !user) {
      Taro.showToast({
        title: '订单信息不完整',
        icon: 'none'
      })
      return
    }

    try {
      setLoading(true)
      
      // 调用创建订单的 API 服务
      // 将 OrderData 转换为 RecycleFormData 格式
      const recycleFormData = {
        userId: user.id,
        categoryId: 1, // 默认分类ID，实际应该从orderData.category解析
        items: [{
          name: orderData.category,
          description: orderData.description,
          estimatedWeight: parseFloat(orderData.weight) || 0,
          photos: orderData.images,
          condition: 'good'
        }],
        addressId: 1, // 默认地址ID，实际应该从orderData.pickupAddress解析
        appointmentTime: orderData.pickupTime,
        notes: orderData.remarks,
        doorToDoorService: true
      }

      const result = await createOrder(recycleFormData)

      if (result.success && result.data) {
        Taro.showToast({
          title: '订单提交成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          Taro.redirectTo({
            url: `/pages/order/detail/index?id=${result.data!.id}`
          })
        }, 1500)
      } else {
        throw new Error(result.message || '订单提交失败')
      }
    } catch (error) {
      logger.error('提交订单失败:', error)
      Taro.showToast({
        title: error instanceof Error ? error.message : '提交失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [loading, orderData, user])

  const handleEditAddress = () => {
    Taro.navigateTo({
      url: '/pages/address/select/index?from=order'
    })
  }

  const handleEditTime = () => {
    Taro.showActionSheet({
      itemList: ['今天 14:00-16:00', '今天 16:00-18:00', '明天 09:00-11:00', '明天 14:00-16:00'],
      success: (res) => {
        if (orderData) {
          const timeSlots = ['今天 14:00-16:00', '今天 16:00-18:00', '明天 09:00-11:00', '明天 14:00-16:00']
          const pickupTime = timeSlots[res.tapIndex] ?? orderData.pickupTime
          setOrderData({
            ...orderData,
            pickupTime
          })
        }
      }
    })
  }

  if (!orderData) {
    return (
      <View className='order-confirm loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView className='order-confirm' scrollY>
      {/* 地址信息 */}
      <View className='section address-section'>
        <View className='section-header'>
          <Icon name='map-pin' size='20' color='#00B894' />
          <Text className='section-title'>上门地址</Text>
          <Button className='edit-btn' onClick={handleEditAddress}>
            <Icon name='edit' size='16' color='#666' />
            <Text>修改</Text>
          </Button>
        </View>
        <View className='address-info'>
          <Text className='address-text'>{orderData.pickupAddress}</Text>
          <Text className='contact-text'>联系电话：{orderData.contactPhone}</Text>
        </View>
      </View>

      {/* 时间信息 */}
      <View className='section time-section'>
        <View className='section-header'>
          <Icon name='clock' size='20' color='#00B894' />
          <Text className='section-title'>上门时间</Text>
          <Button className='edit-btn' onClick={handleEditTime}>
            <Icon name='edit' size='16' color='#666' />
            <Text>修改</Text>
          </Button>
        </View>
        <View className='time-info'>
          <Text className='time-text'>{orderData.pickupTime}</Text>
          <Text className='time-tip'>请确保在预约时间内有人接收</Text>
        </View>
      </View>

      {/* 物品信息 */}
      <View className='section items-section'>
        <View className='section-header'>
          <Icon name='shopping-bag' size='20' color='#00B894' />
          <Text className='section-title'>回收物品</Text>
        </View>
        <View className='item-info'>
          <View className='item-basic'>
            <Text className='category'>{orderData.category}</Text>
            <Text className='weight'>预估重量：{orderData.weight}</Text>
          </View>
          <Text className='description'>{orderData.description}</Text>
          
          {orderData.images && orderData.images.length > 0 && (
            <View className='images-grid'>
              {orderData.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  className='item-image'
                  mode='aspectFill'
                  onClick={() => {
                    Taro.previewImage({
                      urls: orderData.images,
                      current: image
                    })
                  }}
                />
              ))}
            </View>
          )}
          
          {orderData.remarks && (
            <View className='remarks'>
              <Text className='remarks-label'>备注：</Text>
              <Text className='remarks-text'>{orderData.remarks}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 价格预估 */}
      <View className='section price-section'>
        <View className='section-header'>
          <Icon name='credit-card' size='20' color='#00B894' />
          <Text className='section-title'>价格预估</Text>
        </View>
        <View className='price-info'>
          <View className='price-row'>
            <Text className='price-label'>预估回收价</Text>
            <Text className='price-value'>¥{orderData.estimatedPrice.toFixed(2)}</Text>
          </View>
          <View className='price-note'>
            <Icon name='info' size='14' color='#999' />
            <Text className='tip-text'>实际价格以回收员现场评估为准</Text>
          </View>
        </View>
      </View>

      <Divider />

      {/* 提交按钮 */}
      <View className='submit-section'>
        <Button
          className={`submit-btn ${loading ? 'disabled' : 'active'}`}
          onClick={handleSubmitOrder}
          loading={loading}
          disabled={loading}
        >
          {loading ? '提交中...' : '确认下单'}
        </Button>
        <Text className='submit-tip'>提交后我们将尽快安排上门回收</Text>
      </View>
    </ScrollView>
  )
}
