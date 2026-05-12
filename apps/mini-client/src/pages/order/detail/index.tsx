import { Icon } from '@/components/Icon'
import type { NormalizedOrderDetail } from '@/services/order'
import { cancelOrder, confirmOrder, getOrderDetail, normalizeOrderDetail } from '@/services/order'
import { OrderStatus } from '@/types'
import logger from '@/utils/logger'
import { Step, Steps, Tag } from '@nutui/nutui-react-taro'
import { Button, Image, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import './index.scss'

const statusMap: Record<string, { label: string; color: string; desc: string }> = {
  [OrderStatus.PENDING]: { label: '待接单', color: '#F28C28', desc: '等待快递员接单' },
  [OrderStatus.PENDING_PICKUP]: { label: '待上门', color: '#1E7A3E', desc: '快递员已接单，请保持电话畅通' },
  [OrderStatus.PICKED_UP]: { label: '已取件', color: '#2F7E6D', desc: '物品已取件，正在运输中' },
  [OrderStatus.IN_TRANSIT]: { label: '运输中', color: '#2F7E6D', desc: '物品正在运输中' },
  [OrderStatus.PENDING_RECEIPT]: { label: '待收货', color: '#1E7A3E', desc: '等待回收站确认收货' },
  [OrderStatus.INSPECTING]: { label: '验货中', color: '#7FD39A', desc: '正在进行验货' },
  [OrderStatus.INSPECTED]: { label: '已验货', color: '#1E7A3E', desc: '验货完成，等待入库' },
  [OrderStatus.INSPECTION_EXCEPTION]: { label: '验货异常', color: '#FF3D00', desc: '验货异常，等待处理' },
  [OrderStatus.MANUAL_PROCESSING]: { label: '人工处理', color: '#F4B731', desc: '人工处理中' },
  [OrderStatus.PENDING_INBOUND]: { label: '待入库', color: '#7FD39A', desc: '等待入库' },
  [OrderStatus.INBOUNDED]: { label: '已入库', color: '#1E7A3E', desc: '已完成入库' },
  [OrderStatus.PENDING_SETTLEMENT]: { label: '待结算', color: '#F4B731', desc: '等待结算' },
  [OrderStatus.COMPLETED]: { label: '已完成', color: '#1E7A3E', desc: '订单已完成，积分已到账' },
  [OrderStatus.CANCELLED]: { label: '已取消', color: '#FF3D00', desc: '订单已取消' },
  [OrderStatus.REFUNDED]: { label: '已退款', color: '#FF3D00', desc: '订单已退款' }
}

const unwrapOrderDetail = (result: any) => {
  if (!result) return null
  if (result.success === false) return null
  const candidates = [
    result.data,
    result.order,
    result.detail,
    result.payload,
    result,
  ]
  for (const candidate of candidates) {
    if (!candidate) continue
    if (candidate.data) return candidate.data
    if (candidate.order) return candidate.order
    return candidate
  }
  return null
}

export default function OrderDetailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orderDetail, setOrderDetail] = useState<NormalizedOrderDetail | null>(null)
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
      const payload = unwrapOrderDetail(orderResult)
      if (payload) {
        setOrderDetail(normalizeOrderDetail(payload))
      } else {
        setOrderDetail(null)
        Taro.showToast({ title: '订单信息获取失败', icon: 'none' })
      }
    } catch (error) {
      logger.error('加载失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    Taro.setClipboardData({ data: text })
  }

  if (loading) return <View className='loading'>加载中...</View>
  if (!orderDetail) {
    return (
      <View className='loading'>
        <Text>订单信息加载失败</Text>
        {orderId && (
          <Button onClick={() => loadData(orderId)}>重新加载</Button>
        )}
      </View>
    )
  }

  const statusInfo = statusMap[orderDetail.status] ?? statusMap[OrderStatus.PENDING] ?? { label: '未知', color: '#999', desc: '' }
  const amount =
    orderDetail.settlementAmount ??
    (orderDetail.totalPrice > 0 ? orderDetail.totalPrice : undefined) ??
    (orderDetail.estimatedPrice > 0 ? orderDetail.estimatedPrice : 0)
  const formatMoney = (value?: number | string | null) =>
    value !== null && value !== undefined ? `¥${Number(value).toFixed(2)}` : '--'

  return (
    <ScrollView className='order-detail-page' scrollY>
      <View className='status-header' style={{ backgroundColor: statusInfo.color }}>
        <View className='status-content'>
          <Text className='status-title'>{statusInfo.label}</Text>
          <Text className='status-desc'>{statusInfo.desc}</Text>
        </View>
        <Icon name='order' size={48} color='rgba(255,255,255,0.2)' />
      </View>

      {Boolean(orderDetail.courier) && (
        <View className='card logistics-card'>
          <View className='card-header'>
            <View className='express-logo'>
              <Text className='express-text'>回收物流</Text>
            </View>
            <View className='tracking-no' onClick={() => handleCopy(orderDetail.id)}>
              <Text>单号: {orderDetail.id}</Text>
              <Icon name='copy' size={12} color='#999' />
            </View>
          </View>

          <View className='courier-info'>
            <Image className='avatar' src={(orderDetail.courier as any)?.avatar || ''} />
            <View className='info'>
              <Text className='name'>{(orderDetail.courier as any)?.name} 快递员</Text>
              <View className='tags'>
                <Tag type='primary' plain>实名认证</Tag>
                <Tag type='warning' plain>专业回收</Tag>
              </View>
            </View>
            <Button className='call-btn' onClick={() => Taro.makePhoneCall({ phoneNumber: (orderDetail.courier as any)?.phone || '' })}>
              <Icon name='phone' size={16} />
            </Button>
          </View>

          <View className='map-placeholder'>
            <Icon name='location' size={20} color='#2E7D32' />
            <Text>快递员正在为您服务，请保持电话畅通</Text>
          </View>
        </View>
      )}

      <View className='card timeline-card'>
        <View className='card-title'>订单进度</View>
        <Steps direction='vertical' value={(orderDetail.timeline || []).filter(t => t.completed).length}>
          {(orderDetail.timeline || []).map((item, index) => (
            <Step
              key={index}
              title={item.text}
              description={item.time}
            />
          ))}
        </Steps>
      </View>

      <View className='card info-card'>
        <View className='info-row'>
          <Text className='label'>回收品类</Text>
          <Text className='value'>{orderDetail.categoryName}</Text>
        </View>
        <View className='info-row'>
          <Text className='label'>预估回收价</Text>
          <Text className='value highlight'>{formatMoney(orderDetail.estimatedPrice)}</Text>
        </View>
        <View className='info-row'>
          <Text className='label'>订单金额</Text>
          <Text className='value'>{formatMoney(amount)}</Text>
        </View>
        <View className='info-row'>
          <Text className='label'>预约时间</Text>
          <Text className='value'>{orderDetail.appointmentTime}</Text>
        </View>
        <View className='info-row'>
          <Text className='label'>上门地址</Text>
          <Text className='value'>{(orderDetail.address as any)?.detail || ''}</Text>
        </View>
      </View>

      <View className='action-bar'>
        {orderDetail.status === OrderStatus.CANCELLED && (
          <Button className='action-btn cancel' onClick={handleCancel}>取消订单</Button>
        )}
        {orderDetail.status === OrderStatus.PENDING_SETTLEMENT && (
          <Button className='action-btn confirm' onClick={handleConfirm}>确认订单</Button>
        )}
        <Button className='action-btn contact' openType='contact'>联系客服</Button>
      </View>
    </ScrollView>
  )
}
