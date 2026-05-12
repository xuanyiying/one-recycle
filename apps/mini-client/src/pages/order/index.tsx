import logger from '@/utils/logger'
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Button, Image } from '@tarojs/components';
import { Popup } from '@nutui/nutui-react-taro'
import { useAuth } from '@/hooks/useAuth';
import { getUserOrders, normalizeOrder } from '@/services/order';
import type { NormalizedOrder } from '@/services/order';
import AuthGuard from '@/components/AuthGuard';
import { RecycleCard } from '@/components/RecycleCard';
import Icon from '@/components/Icon';
import { OrderStatus } from '@/types';
import { getCdnUrl } from '@/utils/cdn';
import EmptyIcon from '@/assets/images/empty-box.webp'
import { useRecycleNavigation } from '@/hooks/useRecycleNavigation';
import './index.scss';

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    return dateString;
  }
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    [OrderStatus.PENDING]: '待接单',
    [OrderStatus.PENDING_PICKUP]: '待上门',
    [OrderStatus.PICKED_UP]: '已取件',
    [OrderStatus.IN_TRANSIT]: '运输中',
    [OrderStatus.PENDING_RECEIPT]: '待收货',
    [OrderStatus.INSPECTING]: '验货中',
    [OrderStatus.INSPECTED]: '已验货',
    [OrderStatus.INSPECTION_EXCEPTION]: '验货异常',
    [OrderStatus.MANUAL_PROCESSING]: '人工处理',
    [OrderStatus.PENDING_INBOUND]: '待入库',
    [OrderStatus.INBOUNDED]: '已入库',
    [OrderStatus.PENDING_SETTLEMENT]: '待结算',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDED]: '已退款',
  }
  return statusMap[status] || status
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    [OrderStatus.PENDING]: '#ff9500',
    [OrderStatus.PENDING_PICKUP]: '#007aff',
    [OrderStatus.PICKED_UP]: '#5856d6',
    [OrderStatus.IN_TRANSIT]: '#5b86e5',
    [OrderStatus.PENDING_RECEIPT]: '#34c759',
    [OrderStatus.INSPECTING]: '#6c5ce7',
    [OrderStatus.INSPECTED]: '#00b894',
    [OrderStatus.INSPECTION_EXCEPTION]: '#ff6b6b',
    [OrderStatus.MANUAL_PROCESSING]: '#f59e0b',
    [OrderStatus.PENDING_INBOUND]: '#2ed573',
    [OrderStatus.INBOUNDED]: '#1e90ff',
    [OrderStatus.PENDING_SETTLEMENT]: '#34c759',
    [OrderStatus.COMPLETED]: '#2E7D32',
    [OrderStatus.CANCELLED]: '#ff3b30',
    [OrderStatus.REFUNDED]: '#ff3b30',
  }
  return colorMap[status] || '#666';
};

const PAGE_SIZE = 10

const OrderListPage: React.FC = () => {
  const { user } = useAuth();
  const { handleRecycleClick } = useRecycleNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderList, setOrderList] = useState<NormalizedOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const loadOrderList = useCallback(async () => {
    if (!user?.id) {
      setOrderList([])
      setLoading(false)
      return
    }
    try {
      setLoading(true);
      const result = await getUserOrders(user.id);
      if (!result?.data?.orders) {
        logger.warn('订单数据格式异常:', result);
        setOrderList([]);
        return;
      }
      const rawOrders = Array.isArray(result.data.orders) ? result.data.orders : []
      setOrderList(rawOrders.map(normalizeOrder))
    } catch (error) {
      logger.error('加载订单列表失败:', error);
      setOrderList([]);
      Taro.showToast({
        title: '加载失败，请重试',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrderList();
  }, [loadOrderList]);

  Taro.useDidShow(() => {
    const targetTab = Taro.getStorageSync('ORDER_ACTIVE_TAB')
    if (targetTab) {
      setActiveTab(targetTab as any)
      Taro.removeStorageSync('ORDER_ACTIVE_TAB')
    }
    loadOrderList()
  })

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderList();
    setRefreshing(false);
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orderList
    return orderList.filter(order => order.status === activeTab)
  }, [orderList, activeTab])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activeTab, orderList.length])

  const handleLoadMore = useCallback(() => {
    if (visibleCount < filteredOrders.length) {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filteredOrders.length))
    }
  }, [visibleCount, filteredOrders.length])

  const visibleOrders = useMemo(() => {
    return filteredOrders.slice(0, visibleCount)
  }, [filteredOrders, visibleCount])

  const handleOrderClick = useCallback((orderId: string) => {
    Taro.navigateTo({
      url: `/pages/order/detail/index?id=${orderId}`
    });
  }, []);

  const handleCreateOrder = useCallback(() => {
    setShowCategorySelect(true);
  }, []);

  const handleCardClick = useCallback((type: 'book' | 'clothes') => {
    setShowCategorySelect(false);
    handleRecycleClick(type);
  }, [handleRecycleClick]);

  const renderOrderItem = useCallback((order: NormalizedOrder) => (
    <View
      key={order.id}
      className="order-card"
      onClick={() => handleOrderClick(order.id)}
      hoverClass="order-card-hover"
      hoverStayTime={70}
    >
      <View className="card-header">
        <Text className="order-no">订单号 {order.id}</Text>
        <View
          className={`status-tag ${order.status.toLowerCase()}`}
          style={{
            color: getStatusColor(order.status),
            backgroundColor: `${getStatusColor(order.status)}15`
          }}
        >
          <Text className="status-text">{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View className="card-body">
        {Array.isArray(order.items) && order.items.map((item, index) => (
          <View key={index} className="item-row">
            <View className="item-image-placeholder">
              {item.photos && item.photos.length > 0 ? (
                <Image
                  src={getCdnUrl(item.photos[0], { w: 160, h: 160, fmt: 'webp', q: 80 })}
                  className="item-img"
                  mode="aspectFill"
                />
              ) : (
                <View className="icon-wrapper">
                  {(item.categoryName || '').includes('书') ? <Icon name='book' size={24} color='#999' /> : <Icon name='clothes' size={24} color='#999' />}
                </View>
              )}
            </View>
            <View className="item-content">
              <View className="item-main">
                <Text className="item-title">{item.categoryName || '回收物品'}</Text>
                <Text className="item-price">
                  {item.estimatedPrice ? `¥${item.estimatedPrice.toFixed(2)}` : '待估价'}
                </Text>
              </View>
              <View className="item-sub">
                <Text className="item-specs">
                  {(item.weight) ? `${item.weight}kg` : ''}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className="card-footer">
        <View className="info-col">
          <Text className="info-text">{formatDate(order.createdAt)}</Text>
        </View>
        <View className="total-col">
          <Text className="total-label">预估合计</Text>
          <Text className="total-price">
            <Text className="symbol">¥</Text>
            {order.estimatedPrice?.toFixed(2) ?? '0.00'}
          </Text>
        </View>
      </View>
    </View>
  ), [handleOrderClick]);

  return (
    <AuthGuard showLoginPrompt>
      <View className="order-list-page">
        <View className="tab-container">
          <View className="tab-list">
            {[
              { key: 'all', label: '全部' },
              { key: OrderStatus.PENDING, label: '待接单' },
              { key: OrderStatus.PENDING_PICKUP, label: '待上门' },
              { key: OrderStatus.COMPLETED, label: '已完成' }
            ].map(tab => (
              <View
                key={tab.key}
                className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                <Text className="tab-text">{tab.label}</Text>
                {activeTab === tab.key && <View className="active-indicator" />}
              </View>
            ))}
          </View>
        </View>

        <ScrollView
          className="content-container"
          scrollY
          refresherEnabled
          refresherTriggered={refreshing}
          onRefresherRefresh={handleRefresh}
          onScrollToLower={handleLoadMore}
          lowerThreshold={60}
        >
          {loading ? (
            <View className="loading-container">
              <Text className="loading-text">加载中...</Text>
            </View>
          ) : visibleOrders.length > 0 ? (
            <View className="order-list">
              {visibleOrders.map(order => renderOrderItem(order))}
            </View>
          ) : (
            <View className="empty-container">
              <Image
                src={EmptyIcon}
                className="empty-img"
                mode="aspectFit"
              />
              <Text className="empty-title">暂无订单</Text>
              <Text className="empty-desc">
                {activeTab === 'all' ? '快去回收你的第一件物品吧' : '当前状态下没有订单哦'}
              </Text>
              <Button
                className="create-order-btn"
                onClick={handleCreateOrder}
              >
                立即下单
              </Button>
            </View>
          )}
        </ScrollView>

        {
          filteredOrders.length > 0 && (
            <View className="fab-container">
              <Button
                className="fab-btn"
                onClick={handleCreateOrder}
              >
                +
              </Button>
            </View>
          )
        }

        <Popup
          visible={showCategorySelect}
          position="bottom"
          round
          onClose={() => setShowCategorySelect(false)}
          className="category-popup"
        >
          <View className="popup-header">
            <Text className="popup-title">选择回收类型</Text>
            <View className="close-btn" onClick={() => setShowCategorySelect(false)}>
              <Icon name="close" size={20} color="#999" />
            </View>
          </View>
          <View className="category-options">
            <RecycleCard
              type='book'
              onClick={() => handleCardClick('book')}
              className='popup-action-card'
            />
            <RecycleCard
              type='clothes'
              onClick={() => handleCardClick('clothes')}
              className='popup-action-card'
            />
          </View>
        </Popup>
      </View >
    </AuthGuard >
  );
};

export default OrderListPage;
