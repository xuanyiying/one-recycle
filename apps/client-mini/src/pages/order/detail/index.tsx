import { useState, useEffect } from 'react'
import { View, Text, Button, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Step, Steps, Tag } from '@nutui/nutui-react-taro'
import { IconFont, Location } from '@nutui/icons-react-taro'
import { getOrderDetail, cancelOrder, confirmOrder } from '@/services/order'
import { OrderDetail, OrderStatus } from '@/types'
import './index.scss'

const statusMap: Record<OrderStatus, { label: string; color: string; desc: string }> = {
  pending_assignment: { label: '待接单', color: '#ff9500', desc: '等待快递员接单' },
  pending_pickup: { label: '待上门', color: '#007aff', desc: '快递员已接单，请保持电话畅通' },
  in_progress: { label: '回收中', color: '#5856d6', desc: '物品运输/核验中' },
  pending_settlement: { label: '待确认', color: '#34c759', desc: '等待用户确认最终积分' },
  completed: { label: '已完成', color: '#2E7D32', desc: '订单已完成，积分已到账' },
  cancelled: { label: '已取消', color: '#ff3b30', desc: '订单已取消' }
}

export default function OrderDetailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const { id: orderId } = router.params

  const handleCancel = async () => {
    if (!orderId) return
    const res = await Taro.showModal({
      title: '提示',
      content: '确定要取消订单吗？'
    })
    if (res.confirm) {
      try {
        const result = await cancelOrder(orderId)
        if (result.success) {
          Taro.showToast({ title: '订单已取消' })
          loadData(orderId)
        }
      } catch (error) {
        Taro.showToast({ title: '取消失败', icon: 'none' })
      }
    }
  }

  const handleConfirm = async () => {
    if (!orderId) return
    try {
      const result = await confirmOrder(orderId)
      if (result.success) {
        Taro.showToast({ title: '订单已确认' })
        loadData(orderId)
      }
    } catch (error) {
      Taro.showToast({ title: '确认失败', icon: 'none' })
    }
  }

  useEffect(() => {
    if (orderId) {
      loadData(orderId)
    }
  }, [orderId])

  const loadData = async (id: string) => {
    try {
      setLoading(true)
      const orderResult = await getOrderDetail(id)
      
      if (orderResult.success && orderResult.data) {
        setOrderDetail(orderResult.data)
      }
    } catch (error) {
      console.error('加载失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    Taro.setClipboardData({ data: text })
  }

  if (loading || !orderDetail) return <View className='loading'>加载中...</View>

  const statusInfo = statusMap[orderDetail.status]

  return (
    <ScrollView className='order-detail-page' scrollY>
      {/* 状态头部 */}
      <View className='status-header' style={{ backgroundColor: statusInfo.color }}>
        <View className='status-content'>
          <Text className='status-title'>{statusInfo.label}</Text>
          <Text className='status-desc'>{statusInfo.desc}</Text>
        </View>
        <IconFont name='order' size={48} color='rgba(255,255,255,0.2)' />
      </View>

      {/* 物流卡片 (仅在有物流信息时显示) */}
      {orderDetail.courier && (
        <View className='card logistics-card'>
          <View className='card-header'>
            <View className='express-logo'>
              <Text className='express-text'>回收物流</Text>
            </View>
            <View className='tracking-no' onClick={() => handleCopy(orderDetail.id)}>
              <Text>单号: {orderDetail.id}</Text>
              <IconFont name='copy' size={12} color='#999' />
            </View>
          </View>
          
          <View className='courier-info'>
            <Image className='avatar' src={orderDetail.courier?.avatar || ''} />
            <View className='info'>
              <Text className='name'>{orderDetail.courier?.name} 快递员</Text>
              <View className='tags'>
                <Tag type='primary' plain>实名认证</Tag>
                <Tag type='warning' plain>专业回收</Tag>
              </View>
            </View>
            <Button className='call-btn' onClick={() => Taro.makePhoneCall({ phoneNumber: orderDetail.courier?.phone || '' })}>
              <IconFont name='phone' size={16} />
            </Button>
          </View>

          <View className='map-placeholder'>
            <Location size={20} color='#2E7D32' />
            <Text>快递员正在为您服务，请保持电话畅通</Text>
          </View>
        </View>
      )}
  

      {/* 进度轴 */}
      <View className='card timeline-card'>
        <View className='card-title'>订单进度</View>
        <Steps direction='vertical' value={orderDetail.timeline.filter(t => t.completed).length}>
          {orderDetail.timeline.map((item, index) => (
            <Step 
              key={index} 
              title={item.text} 
              description={item.time}
            />
          ))}
        </Steps>
      </View>

      {/* 订单信息 */}
      <View className='card info-card'>
        <View className='info-row'>
          <Text className='label'>回收品类</Text>
          <Text className='value'>{orderDetail.categoryName}</Text>
        </View>
        <View className='info-row'>
          <Text className='label'>预估积分</Text>
          <Text className='value highlight'>{orderDetail.estimatedPrice} 积分</Text>
        </View>
        <View className='info-row'>
          <Text className='label'>预约时间</Text>
          <Text className='value'>{orderDetail.appointmentTime}</Text>
        </View>
        <View className='info-row'>
          <Text className='label'>上门地址</Text>
          <Text className='value'>{orderDetail.address.detail}</Text>
        </View>
      </View>

      {/* 底部操作栏 */}
      <View className='action-bar'>
        {orderDetail.status === 'pending_assignment' && (
          <Button className='action-btn cancel' onClick={handleCancel}>取消订单</Button>
        )}
        {orderDetail.status === 'pending_settlement' && (
          <Button className='action-btn confirm' onClick={handleConfirm}>确认订单</Button>
        )}
        <Button className='action-btn contact' openType='contact'>联系客服</Button>
      </View>
    </ScrollView>
  )
}
