import { useState, useEffect } from 'react'
import { View, Text, Button, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Steps, Tag, Icon } from '../../../components/TaroifyProvider'
import { getOrderDetail, cancelOrder, confirmOrder } from '../../../services/order'
import { OrderDetail, OrderStatus } from '../../../types'
import './index.scss'

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  pending_assignment: { label: '待派单', color: '#ff9500' },
  pending_pickup: { label: '待上门', color: '#007aff' },
  in_progress: { label: '进行中', color: '#5856d6' },
  pending_settlement: { label: '待结算', color: '#34c759' },
  completed: { label: '已完成', color: '#34c759' },
  cancelled: { label: '已取消', color: '#ff3b30' }
}

export default function OrderDetailPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const { id: orderId } = router.params

  useEffect(() => {
    if (orderId) {
      loadOrderDetail(orderId)
    }
  }, [orderId])

  const loadOrderDetail = async (id: string) => {
    try {
      setLoading(true)
      const result = await getOrderDetail(id)
      
      if (result.success && result.data) {
        setOrderDetail(result.data)
        
        // 根据订单状态设置当前步骤
        const statusSteps = ['pending_assignment', 'pending_pickup', 'in_progress', 'pending_settlement', 'completed']
        const stepIndex = statusSteps.indexOf(result.data.status)
        setCurrentStep(stepIndex >= 0 ? stepIndex : 0)
      } else {
        Taro.showToast({
          title: '订单详情加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载订单详情失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!orderDetail) return

    try {
      const result = await cancelOrder(orderDetail.id)
      if (result.success) {
        Taro.showToast({
          title: '订单已取消',
          icon: 'success'
        })
        // 重新加载订单详情
        loadOrderDetail(orderDetail.id)
      } else {
        Taro.showToast({
          title: '取消失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      Taro.showToast({
        title: '取消失败',
        icon: 'none'
      })
    }
  }

  const handleConfirmOrder = async () => {
    if (!orderDetail) return

    try {
      const result = await confirmOrder(orderDetail.id)
      if (result.success) {
        Taro.showToast({
          title: '订单已确认',
          icon: 'success'
        })
        // 重新加载订单详情
        loadOrderDetail(orderDetail.id)
      } else {
        Taro.showToast({
          title: '确认失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('确认订单失败:', error)
      Taro.showToast({
        title: '确认失败',
        icon: 'none'
      })
    }
  }

  if (loading) {
    return (
      <View className='order-detail-page'>
        <View className='loading-container'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!orderDetail) {
    return (
      <View className='order-detail-page'>
        <View className='error-container'>
          <Text className='error-text'>订单详情加载失败</Text>
          <Button 
            className='retry-btn'
            onClick={() => orderId && loadOrderDetail(orderId)}
          >
            重试
          </Button>
        </View>
      </View>
    )
  }

  const statusInfo = statusMap[orderDetail.status]
  const stepItems = [
    { title: '待派单', desc: '等待系统分配回收员' },
    { title: '待上门', desc: '回收员准备上门回收' },
    { title: '进行中', desc: '回收员正在处理订单' },
    { title: '待结算', desc: '等待价格结算' },
    { title: '已完成', desc: '订单处理完成' }
  ]

  return (
    <ScrollView className='order-detail-page' scrollY>
      {/* 订单状态 */}
      <View className='status-section'>
        <Tag 
          style={{ backgroundColor: statusInfo.color, color: '#fff' }}
        >
          {statusInfo.label}
        </Tag>
        <Text className='order-id'>订单号：{orderDetail.id}</Text>
      </View>

      {/* 订单进度 */}
      <View className='progress-section'>
        <Steps
          value={currentStep}
          style={{ margin: '20px 0' }}
        >
          {stepItems.map((item, index) => (
            <Steps.Step key={index} label={item.title}>
              {item.desc}
            </Steps.Step>
          ))}
        </Steps>
      </View>

      {/* 订单信息 */}
      <View className='order-info-section'>
        <View className='section-title'>
          <Icon name='file-text' size='18' color='#00c896' />
          <Text className='title-text'>订单信息</Text>
        </View>
        
        <View className='info-item'>
          <Text className='label'>回收类别：</Text>
          <Text className='value'>{orderDetail.categoryName}</Text>
        </View>
        
        <View className='info-item'>
          <Text className='label'>回收物品：</Text>
          <Text className='value'>{orderDetail.items.map(item => item.name).join('、')}</Text>
        </View>
        
        <View className='info-item'>
          <Text className='label'>预约时间：</Text>
          <Text className='value'>{orderDetail.appointmentTime}</Text>
        </View>

        <View className='info-item'>
          <Text className='label'>回收地址：</Text>
          <Text className='value'>{orderDetail.address.detail}</Text>
        </View>

        <View className='info-item'>
          <Text className='label'>联系人：</Text>
          <Text className='value'>{orderDetail.address.name} {orderDetail.address.phone}</Text>
        </View>
      </View>

      {/* 物品详情 */}
      <View className='items-section'>
        <View className='section-title'>
          <Icon name='shopping-bag' size='18' color='#00c896' />
          <Text className='title-text'>物品详情</Text>
        </View>
        
        {orderDetail.items.map((item, index) => (
          <View key={index} className='item-card'>
            <View className='item-info'>
              <Text className='item-name'>{item.name}</Text>
              <Text className='item-desc'>{item.description}</Text>
              <Text className='item-weight'>预估重量：{item.estimatedWeight}kg</Text>
            </View>
            
            {item.photos && item.photos.length > 0 && (
              <View className='item-photos'>
                {item.photos.map((photo, photoIndex) => (
                  <Image
                    key={photoIndex}
                    className='photo'
                    src={photo}
                    mode='aspectFill'
                    onClick={() => {
                      Taro.previewImage({
                        urls: item.photos,
                        current: photo
                      })
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 价格信息 */}
      <View className='price-section'>
        <View className='section-title'>
          <Icon name='money' size='18' color='#00c896' />
          <Text className='title-text'>价格信息</Text>
        </View>
        
        <View className='price-item'>
          <Text className='label'>预估价格：</Text>
          <Text className='value'>¥{orderDetail.estimatedPrice.toFixed(2)}</Text>
        </View>
        
        <View className='price-item'>
          <Text className='label'>服务费：</Text>
          <Text className='value'>¥{orderDetail.serviceFee.toFixed(2)}</Text>
        </View>
        
        <View className='price-item total'>
          <Text className='label'>总计：</Text>
          <Text className='value'>¥{orderDetail.totalPrice.toFixed(2)}</Text>
        </View>

        {/* 入账信息 - 仅在订单完成时显示 */}
        {orderDetail.status === 'completed' && orderDetail.settlementAmount !== undefined && (
          <View className='settlement-info'>
            <View className='settlement-header'>
              <Tag 
                style={{ backgroundColor: '#52c41a', color: '#fff' }}
              >
                已入账
              </Tag>
              {orderDetail.settlementTime && (
                <Text className='settlement-time'>
                  {orderDetail.settlementTime}
                </Text>
              )}
            </View>
            
            <View className='settlement-amount'>
              <Text className='label'>入账金额：</Text>
              <Text className='amount'>¥{orderDetail.settlementAmount.toFixed(2)}</Text>
            </View>
            
            <Button 
              className='view-transaction-btn'
              onClick={() => {
                Taro.navigateTo({
                  url: `/pages/transaction/list?orderId=${orderDetail.id}`
                })
              }}
            >
              查看交易明细
            </Button>
          </View>
        )}
      </View>

      {/* 回收员信息 */}
      {orderDetail.courier && (
        <View className='courier-section'>
          <View className='section-title'>
            <Icon name='user' size='18' color='#00c896' />
            <Text className='title-text'>回收员信息</Text>
          </View>
          
          <View className='courier-info'>
            <Image 
              className='courier-avatar'
              src={orderDetail.courier.avatar}
              mode='aspectFill'
            />
            <View className='courier-details'>
              <Text className='courier-name'>{orderDetail.courier.name}</Text>
              <Text className='courier-phone'>{orderDetail.courier.phone}</Text>
              <View className='courier-rating'>
                <Icon name='star' size='14' color='#ffca28' />
                <Text className='rating-text'>{orderDetail.courier.rating}</Text>
              </View>
            </View>
            <Button 
              className='call-btn'
              size='mini'
              onClick={() => {
                Taro.makePhoneCall({
                  phoneNumber: orderDetail.courier!.phone
                })
              }}
            >
              拨打电话
            </Button>
          </View>
        </View>
      )}

      {/* 订单时间线 */}
      <View className='timeline-section'>
        <View className='section-title'>
          <Icon name='clock' size='18' color='#00c896' />
          <Text className='title-text'>订单动态</Text>
        </View>
        
        {orderDetail.timeline.map((item, index) => (
          <View key={index} className={`timeline-item ${item.completed ? 'completed' : ''}`}>
            <View className='timeline-dot' />
            <View className='timeline-content'>
              <Text className='timeline-text'>{item.text}</Text>
              <Text className='timeline-time'>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 操作按钮 */}
      <View className='action-section'>
        {orderDetail.status === 'pending_assignment' && (
          <Button 
            className='cancel-btn'
            onClick={handleCancelOrder}
          >
            取消订单
          </Button>
        )}
        
        {orderDetail.status === 'pending_settlement' && (
          <Button 
            className='confirm-btn'
            type='primary'
            onClick={handleConfirmOrder}
          >
            确认完成
          </Button>
        )}
      </View>
    </ScrollView>
  )
}